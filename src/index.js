//This stays at the very top so our process environment context is loaded first
//Database password and stuff
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import DataLoader from "dataloader";
import loaders from "./loaders";

import schema from "./schema";
import resolvers from "./resolvers";
import models, { sequelize } from "./models";

/*
 * Middlewares:
 *  1. Cors
 *  2. Apollo Server
 */
const app = express();
app.use(cors());

//The set of dataloader cachenabled loaders
// - Be aware, caching is sometimes problematic with realtime updates!
// const userLoader = new DataLoader(keys => loaders.user.batchUsers(keys, models));

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace("SequelizeValidationError: ", "")
      .replace("Validation error: ", "");

    return {
      ...error,
      message
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models
      };
    }

    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
        //passing loaders into context
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
          messages: new DataLoader(keys =>
            loaders.messages.batchMessages(keys, models)
          )
        }
      };
    }
  }
});

server.applyMiddleware({ app, path: "/graphql" });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
const eraseDatabaseOnSync = true;

//Test for dev environment / test
const isTest = !!process.env.TEST_DATABASE;
const isProduction = !!process.env.DATABASE_URL;
const port = process.env.PORT || 8000;

sequelize.sync({ force: isTest || isProduction }).then(async () => {
  if (isTest || isProduction) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port }, () => {
    console.log(
      `\n🚀  Apollo Initialed on \x1b[33mhttp://localhost:${port}/graphql\x1b[0m\n`
    );
  });
});

const getMe = async req => {
  const token = req.headers["x-token"];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError("Your session expired. Sign in again.");
    }
  }
};

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: "rwieruch",
      email: "hello@robin.com",
      password: "rwieruch",
      //this is for our test for the new Permission Role based authentication system
      role: "ADMIN",
      messages: [
        {
          text: "Published the Road to learn React",
          createdAt: date.setSeconds(date.getSeconds() + 2)
        }
      ]
    },
    {
      include: [models.Message]
    }
  );

  await models.User.create(
    {
      username: "ddavids",
      email: "hello@david.com",
      password: "ddavids",
      messages: [
        {
          text: "Happy to release ...",
          createdAt: date.setSeconds(date.getSeconds() + 2)
        },
        {
          text: "Published a complete ...",
          createdAt: date.setSeconds(date.getSeconds() + 2)
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
