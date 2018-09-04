import { gql } from "apollo-server-express";

/* 
 * Furthermore, note the extend statement on the Query and Mutation types. 
 * Since you have more than one of those types now, you need to extend the types. 
 * Finally you have to define shared base types for them in the src/schema/index.js:
 */


export default gql`
  extend type Query {
    users: [User]
    user(id: ID): User
    me: User
  }

  type User {
    id: ID
    username: String
    messages: [Message]
  }
`;