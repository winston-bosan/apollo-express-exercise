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

//ssl config
const configurations = {
  // Note: You may need sudo to run on port 443
  production: { ssl: false, port: 443, hostname: 'example.com' },
  development: { ssl: false, port: 4000, hostname: 'localhost' }
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment];


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
app.get('/', (req, res) => res.send('Hello World!'))
server.applyMiddleware({ app, path: "/graphql" });

//HTTP or HTTPS?
let httpServer;
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  httpServer = https.createServer(
    {
      key: fs.readFileSync(`./ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./ssl/${environment}/server.crt`)
    },
    app
  )
} else {
  httpServer = http.createServer(app)
}


server.installSubscriptionHandlers(httpServer);
// const eraseDatabaseOnSync = true;

//Test for dev environment / test
const isTest = !!process.env.TEST_DATABASE;
const isDev = process.env.NODE_ENV === 'development';
const isProduction = !!process.env.DATABASE_URL;
const port = process.env.PORT || 8000;

sequelize
  .sync({
    force: isTest || isDev
  })
  .then(async () => {
    if (isTest || isDev) {
      createUsersWithActs(new Date());
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

const createUsersWithActs = async date => {
  await models.User.create(
    {
      username: "rwieruch",
      email: "hello@robin.com",
      password: "rwieruch",
      //this is for our test for the new Permission Role based authentication system
      role: "ADMIN",
      lists: [
        {
          title: "Main List",
          sortOrder: 50,
          acts: [
            {
              title: "Published the Road to learn React",
              content: "This is something you should be doing anyways",
              createdAt: date.setSeconds(date.getSeconds() + 2),
              sortOrder: 50,
              movements: [
                {
                  title: "This belongs NOT to you!",
                  content: "This is",
                  createdAt: date.setSeconds(date.getSeconds() + 2)
                }
              ]
            }
          ]
        }
      ]
    },
    {
      include: [
        {
          model: models.List,
          include: [{ model: models.Act, include: [models.Movement] }]
        }
      ]
    }
  )
    .then(rwieruch => {
      const primary = rwieruch.lists[0].acts;
      primary[0].setUser(rwieruch);
    })
    .catch(error => {
      console.log(error);
    });

  await models.User.create(
    {
      username: "ddavids",
      email: "hello@david.com",
      password: "ddavids",
      lists: [
        {
          title: "Main List",
          sortOrder: 50,
          acts: [
            {
              title: "Happy to release ...",
              content: "This is something...",
              createdAt: date.setSeconds(date.getSeconds() + 2),
              sortOrder: 50,
              vud: {
                value: 1,
                urgency: 8,
                duration: 3
              },
              movements: [
                {
                  title: "Published",
                  content: "This is",
                  createdAt: date.setSeconds(date.getSeconds() + 2),
                  completed: true
                }
              ]
            },
            {
              title: "Published a complete ...",
              content: "... you should be doing anyways",
              createdAt: date.setSeconds(date.getSeconds() + 2),
              sortOrder: -100,
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
              title: "The third? ...",
              content: "... you should be doing anyways",
              createdAt: date.setSeconds(date.getSeconds() + 2),
              sortOrder: -50,
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
          title: "Secondary List",
          sortOrder: 40,
          acts: [
            {
              title: "This is on the secondary list ...",
              content: "I am the primary act for the secondayr lsit...",
              createdAt: date.setSeconds(date.getSeconds() + 2),
              sortOrder: 50,
              vud: {
                value: 1,
                urgency: 8,
                duration: 3
              },
              movements: [
                {
                  title: "Uselses movement in secondary list",
                  content: "secondary list",
                  createdAt: date.setSeconds(date.getSeconds() + 2),
                  completed: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      include: [
        {
          model: models.List,
          include: [{ model: models.Act, include: [models.Movement] }]
        }
      ]
    }
  )
    .then(ddavids => {
      const primary = ddavids.lists[0].acts;
      const secondary = ddavids.lists[1].acts;
      primary[0].setUser(ddavids);
      primary[1].setUser(ddavids);
      primary[2].setUser(ddavids);
      secondary[0].setUser(ddavids);
    })
    .catch(error => {
      console.log(error);
    });
};
