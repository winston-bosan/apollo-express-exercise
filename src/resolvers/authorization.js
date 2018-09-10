import { ForbiddenError } from "apollo-server";
import { skip, combineResolvers } from "graphql-resolvers";

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError("Not authenticated as user.");

export const isActOwner = async (parent, { id }, { models, me }) => {
  const act = await models.Act.findById(id, { raw: true });
  if (act.userId !== me.id) {
    throw new ForbiddenError("Not authenticated as owner.");
  }
  return skip;
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  async (parent, args, { me: {role} }) => {
    if (role !== "ADMIN") {
      throw new ForbiddenError("Not authorized as Admin.");
    }
    return skip;
  }
);
