import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    movements: [Movement]
    movement(id: ID): Movement
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
  }
`;
