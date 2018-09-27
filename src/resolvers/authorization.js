import { ForbiddenError } from "apollo-server";
import { skip, combineResolvers } from "graphql-resolvers";
import jwt from "jsonwebtoken";

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError("Not authenticated as user.");

export const isListOwner = async (parent, { id }, { models, me }) => {
  const list = await models.List.findById(id, { raw: true });
  if (list.userId !== me.id) {
    throw new ForbiddenError("Not authenticated as owner.");
  }
  return skip;
};

export const isActOwner = async (parent, { id }, { models, me }) => {
  const act = await models.Act.findById(id, { raw: true });
  if (act.userId !== me.id) {
    throw new ForbiddenError("Not authenticated as owner.");
  }
  return skip;
};

// export const isActIdOwner = async (parent, { actId }, { models, me }) => {
//   const act = await models.Act.findById(actId, { raw: true });
//   if (act.userId !== me.id) {
//     throw new ForbiddenError("Not authenticated as owner.");
//   }
//   return skip;
// };

export const isMovementOwner = async (parent, { id }, { models, me }) => {
  const movement = await models.Movement.findById(id, { raw: true });
  const act = await models.Act.findById(movement.actId, { raw: true });
  console.log(act.userId, me.id);
  if (act.userId !== me.id) {
    throw new ForbiddenError("Not authenticated as owner.");
  }
  return skip;
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  async (parent, args, { me: { role } }) => {
    if (role !== "ADMIN") {
      throw new ForbiddenError("Not authorized as Admin.");
    }
    return skip;
  }
);


