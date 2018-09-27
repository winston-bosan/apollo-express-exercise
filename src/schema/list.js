import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    lists: [List]
    list(id: ID): List
  }

  extend type Mutation {
    createList(title: String, sortOrder: Float, actLimit: Int): List
    deleteList(id: ID): Boolean
    modifyListSortOrder(id: ID, sortOrder: Float): Boolean
    mergeList(id: ID, input: ListInput): List
  }

  extend type Subscription {
    listCreated(token: String): ListCreated
    listModified(token: String): ListModified
    listRemoved(token: String): ListRemoved
  }

  type List {
    id: ID
    title: String
    actLimit: Int
    acts: [Act]
    user: User
    sortOrder: Float
  }

  input ListInput {
    id: ID
    title: String
    actLimit: Int
    acts: [ID]
    userId: ID
    sortOrder: Float
  }


  type ListCreated {
    list: List
  }
  type ListModified {
    list: List
  }
  type ListRemoved {
    listId: ID
    userId: ID
  }

`;
