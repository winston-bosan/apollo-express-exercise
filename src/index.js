//This stays at the very top so our process environment context is loaded first
//Database password and stuff
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";

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
        secret: process.env.SECRET
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
sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log(
      "\n🚀  Apollo Initialed on \x1b[33mhttp://localhost:8000/graphql\x1b[0m\n"
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
