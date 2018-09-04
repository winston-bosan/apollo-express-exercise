//This stays at the very top so our process environment context is loaded first
//Database password and stuff
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer, gql } from "apollo-server-express";

import schema from "./schema";
import resolvers from "./resolvers";
import models from "./models";

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
  context: {
    models,
    me: models.users[1]
  }
});

server.applyMiddleware({ app, path: "/graphql" });

app.listen({ port: 8000 }, () => {
  console.log(
    "\n🚀  Apollo Initialed on \x1b[33mhttp://localhost:8000/graphql\x1b[0m\n"
  );
});
