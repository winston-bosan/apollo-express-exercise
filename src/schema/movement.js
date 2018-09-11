import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    movements: [Movement]
    movement(id: ID): Movement
  }

  extend type Mutation {
    createMovement(title: String, content: String, actId: ID): Movement
    deleteMovement(id: ID): Boolean
    toggleCompleted(id: ID): Boolean
  }

  type Movement {
    id: ID
    title: String
    content: String
    act: Act
    user: User
    userId: String
    parentId: String
    createdAt: String
    completed: Boolean
  }
`;
