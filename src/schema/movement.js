import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    movements: [Movement]
    movement(id: ID): Movement
  }

  extend type Mutation {
    createMovement(title: String, content: String, actId: ID): Movement
    deleteMovement(id: ID): Boolean
    mergeMovement(id: ID, input: MovementInput): Movement
    toggleCompleted(id: ID): Boolean
  }

  extend type Subscription {
    movementCreated(token: String): MovementCreated
    movementModified(token: String): MovementModified
    movementRemoved(token: String): MovementRemoved
  }

  input MovementInput {
    title: String
    content: String
    completed: Boolean
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


  type MovementCreated {
    movement: Movement
  }
  type MovementModified {
    movement: Movement
  }
  type MovementRemoved {
    movementId: ID
    userId: ID
  }

`;
