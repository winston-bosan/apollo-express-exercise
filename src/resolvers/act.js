import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isActOwner } from "./authorization";
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
    createAct: combineResolvers(
      isAuthenticated,
      async (parent, { title, content, sortOrder }, { models, me }) => {
        const Act = await models.Act.create({
          title,
          content,
          sortOrder,
          userId: me.id
        });
        // pubsub.publish(EVENTS.Act.CREATED, {
        //   actCreated: { Act }
        // });
        return Act;
      }
    ),
    deleteAct: combineResolvers(
      isAuthenticated,
      isActOwner,
      async (parent, { id }, { models }) => {
        return models.Act.destroy({
          where: { id }
        });
      }
    )
  },

  Act: {
    user: async (message, args, { models }) => {
      return await models.User.findById(message.userId);
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
