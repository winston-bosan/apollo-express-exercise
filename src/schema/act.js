import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    acts: [Act]
    act(id: ID): Act
  }

  extend type Mutation {
    createAct(title: String, content: String, sortOrder: Int): Act
    deleteAct(id: ID): Boolean
    modifySortOrder(id: ID, sortOrder: Float): Boolean
  }

  extend type Subscription {
    actCreated: ActCreated
    actModified: ActModified
    actRemoved: ActRemoved
  }

  type Act {
    id: ID
    title: String
    content: String
    user: User
    createdAt: String
    movements: [Movement]
    vud: Vud
    sortOrder: Float
  }

  type ActCreated {
    act: Act
  }
  type ActModified {
    act: Act
  }
  type ActRemoved {
    actId: ID
  }

  type Vud {
    value: Int
    urgency: Int
    duration: Int
  }
`;
