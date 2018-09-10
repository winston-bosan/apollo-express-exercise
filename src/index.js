//This stays at the very top so our process environment context is loaded first
//Database password and stuff
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
// import DataLoader from "dataloader";
// import loaders from "./loaders";

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
  introspection: true,
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const act = error.act
      .replace("SequelizeValidationError: ", "")
      .replace("Validation error: ", "");

    return {
      ...error,
      act
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
        //passing loaders into context
        // loaders: {
        //   user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
        //   messages: new DataLoader(keys =>
        //     loaders.messages.batchMessages(keys, models)
        //   )
        // }
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

sequelize
  .sync({
    force:
      //isTest || isProduction
      eraseDatabaseOnSync
  })
  .then(async () => {
    createUsersWithActs(new Date());
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

const createUsersWithActs = async date => {
  // await models.User.create(
  //   {
  //     username: "rwieruch",
  //     email: "hello@robin.com",
  //     password: "rwieruch",
  //     //this is for our test for the new Permission Role based authentication system
  //     role: "ADMIN",
  //     acts: [
  //       {
  //         title: "Published the Road to learn React",
  //         content: "This is something you should be doing anyways",
  //         createdAt: date.setSeconds(date.getSeconds() + 2),
  //         // movements: [
  //         //   {
  //         //     title: "Published",
  //         //     content: "This is",
  //         //     createdAt: date.setSeconds(date.getSeconds() + 2),
  //         //   }
  //         // ]
  //       }
  //     ]
  //   },
  //   {
  //     include: [{ association: models.Act, include: [models.Movement] }]
  //   }
  // ).catch(error => {
  //   console.log(error);
  // });

  await models.User.create(
    {
      username: "ddavids",
      email: "hello@david.com",
      password: "ddavids",
      acts: [
        {
          title: "Happy to release ...",
          content: "This is something...",
          createdAt: date.setSeconds(date.getSeconds() + 2),
          vud: {
            value: 1,
            urgency: 8,
            duration: 3
          },
          movements: [
            {
              title: "Published",
              content: "This is",
              createdAt: date.setSeconds(date.getSeconds() + 2)
            }
          ]
        },
        {
          title: "Published a complete ...",
          content: "... you should be doing anyways",
          createdAt: date.setSeconds(date.getSeconds() + 2),
          vud: {
            value: 1,
            urgency: 8,
            duration: 3
          },
          movements: [
            {
              title: "Published",
              content: "This is",
              createdAt: date.setSeconds(date.getSeconds() + 2)
            }
          ]
        }
      ]
    },
    {
      include: { model: models.Act, include: [models.Movement] }
    }
  ).catch(error => {
    console.log(error);
  });
};
