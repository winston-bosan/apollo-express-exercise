import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    acts: [Act]
    act(id: ID): Act
  }

  type Act {
    id: ID
    title: String
    content: String
    user: User
    createdAt: String
    movements: [Movement]
    vud: Vud
  }

  type Vud {
    value: Int
    urgency: Int
    duration: Int
  }
`;
