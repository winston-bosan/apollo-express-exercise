import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
//For subscription sake (Resolver)
import pubsub, { EVENTS } from "../subscription";

const toCursorHash = string => Buffer.from(string).toString("base64");

const fromCursorHash = string =>
  Buffer.from(string, "base64").toString("ascii");

export default {
  Query: {
    //Cursor-based Pagination
    acts: async (parent, { cursor, limit = 100 }, { models }) => {
      return models.Act.findAll({});
    }
  },

  Mutation: {
    
  },

  Act: {
    user: async (message, args, { models }) => {
      return await models.User.findById(message.userId)
    },
    movements: async (act, args, { models, loaders }) => {
      // const result = await loaders.messages.load(user.id);
      // return result;
      return await models.Movement.findAll({
        where: {
          actId: act.id
        }
      });
    }

    // createdAt: message => {
    //   return new Date(message.createdAt).toISOString();
    // }
  },

  //Subscribing to the Subscr
  Subscription: {}
};
