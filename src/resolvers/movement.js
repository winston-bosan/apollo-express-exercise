import Sequelize from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isMovementOwner } from "./authorization";
//For subscription sake (Resolver)
import pubsub, { EVENTS } from "../subscription";

export default {
  Query: {
    //Cursor-based Pagination
    movements: async (parent, { cursor, limit = 100 }, { models }) => {
      return (await models.Movement.findAll({})) || [];
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
      async (parent, { id }, { models }) => {
        const destroyedMovement = models.Movement.destroy({
          where: { id }
        });

        pubsub.publish(EVENTS.MOVEMENT.CREATED, {
          movementRemoved: {
            movementId: destroyedMovement ? id : null
          }
        });

        return destroyedMovement;
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
            movementId: id,
            completed: movement.completed
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
    }
  },

  //Subscribing to the Subscr
  Subscription: {
    movementCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MOVEMENT.CREATED)
    },
    movementModified: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MOVEMENT.MODIFIED)
    },
    movementRemoved: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MOVEMENT.REMOVED)
    }
  }
};
