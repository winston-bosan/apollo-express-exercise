import { ForbiddenError } from "apollo-server";
import { skip, combineResolvers } from "graphql-resolvers";

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError("Not authenticated as user.");

export const isMessageOwner = async (parent, { id }, { models, me }) => {
  const message = await models.Message.findById(id, { raw: true });
  if (message.userId !== me.id) {
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
