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
    mergeAct(id: ID, input: ActInput): Act
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

  input ActInput {
    id: ID
    title: String
    content: String
    userId: String
    createdAt: String
    movements: [MovementIdInput]
    sortOrder: Float
   }

  input MovementIdInput{
    id: ID
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
