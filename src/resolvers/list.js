import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import {
  isAuthenticated,
  isActOwner,
  isListOwner,
  subAuth
} from "./authorization";
//For subscription sake (Resolver)
import pubsub, { EVENTS } from "../subscription";
import { withFilter } from "graphql-subscriptions";
import jwt from "jsonwebtoken";

const toCursorHash = string => Buffer.from(string).toString("base64");
const fromCursorHash = string =>
  Buffer.from(string, "base64").toString("ascii");

export default {
  Query: {
    //Cursor-based Pagination
    lists: async (parent, { cursor, limit = 100 }, { models, me }) => {
      return models.List.findAll({ where: { userId: me.id } });
    }
  },

  Mutation: {
    createList: combineResolvers(
      isAuthenticated,
      async (_, { title, sortOrder, actLimit }, { models, me }) => {
        const List = await models.List.create({
          title,
          sortOrder,
          actLimit,
          userId: me.id
        });
        pubsub.publish(EVENTS.LIST.CREATED, {
          listCreated: {
            list: List
          }
        });
        return List;
      }
    ),
    deleteList: combineResolvers(
      isAuthenticated,
      isListOwner,
      async (parent, { id }, { models, me }) => {
        const destroyResult = await models.List.destroy({
          where: { id }
        });
        pubsub.publish(EVENTS.LIST.REMOVED, {
          listRemoved: {
            listId: destroyResult ? id : null,
            userId: me.id
          }
        });
        return destroyResult;
      }
    ),
    modifyListSortOrder: combineResolvers(
      isAuthenticated,
      isListOwner,
      async (parent, { id, sortOrder }, { models }) => {
        const list = await models.List.findById(id);

        list.sortOrder = sortOrder;
        list.save().then(() => {});

        pubsub.publish(EVENTS.LIST.MODIFIED, {
          listModified: {
            list: list
          }
        });

        return !!list;
      }
    ),
    mergeList: combineResolvers(
      isAuthenticated,
      isListOwner,
      async (parent, { id, input }, { models }) => {
        const list = await models.List.findById(id);
        list.update(input);
        list.save().then(() => {});

        pubsub.publish(EVENTS.LIST.MODIFIED, {
          listModified: {
            list: list
          }
        });

        return list;
      }
    )
  },

  List: {
    user: async (_, args, { models }) => {
      return await models.User.findById(_.userId);
    },
    acts: async (_, args, { models, loaders }) => {
      // const result = await loaders.messages.load(user.id);
      // return result;
      return await models.Act.findAll({
        where: {
          listId: _.id
        }
      });
    }

    // createdAt: message => {
    //   return new Date(message.createdAt).toISOString();
    // }
  },

  // //Subscribing to the Subscr
  Subscription: {
    listCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.LIST.CREATED),
        async (payload, variables, context, info) => {
          const payloadUserId = payload.listCreated.list.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          return payloadUserId === decodedToken.id;
        }
      )
    },
    listModified: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.LIST.MODIFIED),
        async (payload, variables, context, info) => {
          const payloadUserId = payload.listModified.list.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          return payloadUserId === decodedToken.id;
        }
      )
    },
    listRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.LIST.REMOVED),
        async (payload, variables, context, info) => {
          const payloadUserId = payload.listRemoved.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          return payloadUserId === decodedToken.id;
        }
      )
    }
  }
};
