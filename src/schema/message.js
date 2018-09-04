import { gql } from 'apollo-server-express';

//use extend type Athing {} when modularizaing

/* 
 * Furthermore, note the extend statement on the Query and Mutation types. 
 * Since you have more than one of those types now, you need to extend the types. 
 * Finally you have to define shared base types for them in the src/schema/index.js:
 */

export default gql`
  extend type Query {
    messages: [Message]
    message(id: ID): Message
  }

  extend type Mutation {
    createMessage(text: String): Message
    deleteMessage(id: ID): Boolean
  }

  type Message {
    id: ID
    text: String
    user: User
  }
`;