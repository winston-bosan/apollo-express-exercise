import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers/lib/combineResolvers";
import { isAdmin } from "./authorization";

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, {
    expiresIn
  });
};

export default {
  Query: {
    users: async (parent, args, { models }) => {
      return await models.User.findAll();
    },
    user: async (parent, { id }, { models }) => {
      return await models.User.findById(id);
    },
    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
      return await models.User.findById(me.id);
    }
  },

  Mutation: {
    signUp: async (
      parent,
      { username, email, password },
      { models, secret }
    ) => {
      const user = await models.User.create({
        username,
        email,
        password
      });

      return { token: createToken(user, secret, "30m") };
    },

    signIn: async (parent, { login, password }, { models, secret }) => {
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password.");
      }

      return { token: createToken(user, secret, "30m") };
    },

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        return await models.User.destroy({ where: { id } });
      }
    )
  },

  User: {
    acts: async (user, args, { models, loaders }) => {
      // const result = await loaders.messages.load(user.id);
      // return result;
      return await models.Act.findAll({
        where: {
          userId: user.id
        }
      });
    },
    movements: async (user, args ,{ models }) => {
      let childrenActs = await models.Act.findAll({
        where: {
          userId: user.id
        }
      })
      let childrenActsIds = childrenActs.map(act => {
        return act.id
      })
      console.log(childrenActsIds)
      let grandchildrenMovements = await models.Movement.findAll({
        where: {
          actId: childrenActsIds
        }
      });
      return grandchildrenMovements;
    }
  }
};

// const result = await loaders.message.load(user.id);
// console.group()
// console.log(result.dataValues);
// console.groupEnd()
// return result;
