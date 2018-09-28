import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isMovementOwner } from "./authorization";
//For subscription sake (Resolver)
import pubsub, { EVENTS } from "../subscription";
import { withFilter } from "graphql-subscriptions";
import jwt from "jsonwebtoken";

export default {
  Query: {
    //Cursor-based Pagination
    movements: async (parent, { cursor, limit = 100 }, { models, me }) => {
      console.log(me.id);
      const result =
        (await models.Movement.findAll({
          include: [
            {
              model: models.Act,
              where: { userId: me.id },
              attributes: ["userId"],
              required: true
            }
          ]
        })) || [];
      return result;
    },
    movement: async (parent, { id }, { models }) => {
      return await models.Movement.findById(id);
    }
  },

  Mutation: {
    createMovement: combineResolvers(
      isAuthenticated,
      async (parent, { title, content, actId }, { models, me }) => {
        // let parentAct = await models.Act.findById(actId);
        const Movement = await models.Movement.create({
          title,
          content,
          actId
        });

        pubsub.publish(EVENTS.MOVEMENT.CREATED, {
          movementCreated: {
            movement: Movement
          }
        });

        return Movement;
      }
    ),
    deleteMovement: combineResolvers(
      isAuthenticated,
      isMovementOwner,
      async (parent, { id }, { models, me }) => {
        const destroyedMovement = models.Movement.destroy({
          where: { id }
        });

        pubsub.publish(EVENTS.MOVEMENT.REMOVED, {
          movementRemoved: {
            movementId: destroyedMovement ? id : null,
            userId: me.id
          }
        });

        return destroyedMovement;
      }
    ),
    mergeMovement: combineResolvers(
      isAuthenticated,
      isMovementOwner,
      async (parent, { id, input }, { models }) => {
        const movement = await models.Movement.findById(id);
        movement.update(input);
        movement.save().then(() => {});

        pubsub.publish(EVENTS.MOVEMENT.MODIFIED, {
          movementModified: {
            movement: movement
          }
        });

        return movement;
      }
    ),
    toggleCompleted: combineResolvers(
      isAuthenticated,
      isMovementOwner,
      async (parent, { id }, { models }) => {
        const movement = await models.Movement.findById(id);

        movement.completed = !movement.completed;
        movement.save().then(() => {});

        pubsub.publish(EVENTS.MOVEMENT.MODIFIED, {
          movementModified: {
            movement
          }
        });

        return !!movement;
      }
    )
  },

  Movement: {
    act: async (movement, args, { models }) => {
      return await models.Act.findById(movement.actId);
    },

    user: async (movement, args, { models }) => {
      return await models.Act.findById(movement.actId).then(parentAct => {
        return models.User.findById(parentAct.userId).then(user => {
          return user;
        });
      });
    },

    parentId: async (movement, args, { models }) => {
      let test = await models.Act.findById(movement.actId);
      // console.log(test.id)
      return test.id;
    },

    userId: async (movement, args, { models }) => {
      let test = await models.Act.findById(movement.actId);
      // console.log(test.id)
      return test.userId;
    }
  },

  //Subscribing to the Subscr
  Subscription: {
    movementCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.MOVEMENT.CREATED),
        async (payload, variables) => {
          //First, retrieve the movement's parrent, and then the user's id
          const actOfMovement = await context.models.Act.findOne({where: {
            id: payload.movementCreated.movement.actId
          }})
          const payloadUserId = actOfMovement.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          return payloadUserId === decodedToken.id;
        }
      )
    },
    movementModified: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.MOVEMENT.MODIFIED),
        async (payload, variables, context) => {

          //First, retrieve the movement's parrent, and then the user's id
          const actOfMovement = await context.models.Act.findOne({where: {
            id: payload.movementModified.movement.actId
          }})
          const payloadUserId = actOfMovement.userId;
          const decodedToken = await jwt.verify(
            variables.token,
            process.env.SECRET
          );
          return payloadUserId === decodedToken.id;
        }
      )
    },
    movementRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.MOVEMENT.REMOVED),
        async (payload, variables) => {
          const payloadUserId = payload.movementRemoved.userId;
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
