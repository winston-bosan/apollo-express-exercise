import { gql } from 'apollo-server-express';

import userSchema from './user';
import actSchema from './act';
import movementSchema from './movement';
import listSchema from './list';

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, actSchema, movementSchema, listSchema];
