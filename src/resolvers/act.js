import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isActOwner } from "./authorization";
//For subscription sake (Resolver)
import pubsub, { EVENTS } from "../subscription";
import { withFilter } from "apollo-server";
import jwt from "jsonwebtoken";

const toCursorHash = string => Buffer.from(string).toString("base64");
const fromCursorHash = string =>
  Buffer.from(string, "base64").toString("ascii");

export default {
  Query: {
    //Cursor-based Pagination
    acts: async (parent, { cursor, limit = 100 }, { models, me }) => {
      return models.Act.findAll({ where: { userId: me.id } });
    },
    act: async (parent, { id }, { models, me }) => {
      return models.Act.findOne({ where: { userId: me.id, id: id } });
    }
  },

  Mutation: {
    createAct: combineResolvers(
      isAuthenticated,
      async (parent, { title, content, sortOrder, listId }, { models, me }) => {
        const Act = await models.Act.create({
          title,
          content,
          sortOrder,
          userId: me.id,
          listId: listId
        });
        pubsub.publish(EVENTS.ACT.CREATED, {
          actCreated: {
            act: Act
          }
        });
        return Act;
      }
    ),
    deleteAct: combineResolvers(
      isAuthenticated,
      isActOwner,
      async (parent, { id }, { models, me }) => {
        const destroyResult = await models.Act.destroy({
          where: { id }
        });
        pubsub.publish(EVENTS.ACT.REMOVED, {
          actRemoved: {
            actId: destroyResult ? id : null,
            userId: me.id
          }
        });
        return destroyResult;
      }
    ),
    modifySortOrder: combineResolvers(
      isAuthenticated,
      isActOwner,
      async (parent, { id, sortOrder }, { models }) => {
        const act = await models.Act.findById(id);

        act.sortOrder = sortOrder;
        act.save().then(() => {});

        pubsub.publish(EVENTS.ACT.MODIFIED, {
          actModified: {
            act: act
          }
        });

        return !!act;
      }
    ),
    mergeAct: combineResolvers(
      isAuthenticated,
      isActOwner,
      async (parent, { id, input }, { models }) => {
        const act = await models.Act.findById(id);
        act.update(input);
        act.save().then(() => {});

        pubsub.publish(EVENTS.ACT.MODIFIED, {
          actModified: {
            act: act
          }
        });

        return act;
      }
    )
  },

  Act: {
    user: async (_, args, { models }) => {
      return await models.User.findById(_.userId);
    },
    list: async (_, args, { models }) => {
      return await models.List.findById(_.listId);
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
  Subscription: {
    actCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.ACT.CREATED),
        async (payload, variables) => {
          const payloadUserId = payload.actCreated.act.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          // console.log(payloadUserId, decodedToken.id);
          return payloadUserId === decodedToken.id;
        }
      )
    },
    actModified: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.ACT.MODIFIED),
        async (payload, variables) => {
          const payloadUserId = payload.actModified.act.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          // console.log(payloadUserId, decodedToken.id);
          return payloadUserId === decodedToken.id;
        }
      )
    },
    actRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.ACT.REMOVED),
        async (payload, variables) => {
          const payloadUserId = payload.actRemoved.userId;
          // console.log(payloadUserId);
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          // console.log(payloadUserId, decodedToken.id);
          return payloadUserId === decodedToken.id;
        }
      )
    }
  }
};
