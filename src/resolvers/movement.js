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
        let parentAct = await models.Act.findById(actId);
        const Movement = await models.Movement.create({
          title,
          content,
          actId
        });
        return Movement;
      }
    ),
    deleteMovement: combineResolvers(
      isAuthenticated,
      isMovementOwner,
      async (parent, { id }, { models }) => {
        return models.Movement.destroy({
          where: { id }
        });
      }
    ),
    toggleCompleted: combineResolvers(
      isAuthenticated,
      isMovementOwner,
      async (parent, { id }, { models }) => {
        const movement = await models.Movement.findById(id);
        console.log(movement)
        movement.completed = !movement.completed;
        movement.save().then(() => {})
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
      return test.id;
    }
  },

  //Subscribing to the Subscr
  Subscription: {}
};
