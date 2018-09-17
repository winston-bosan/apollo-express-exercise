import { PubSub } from 'apollo-server';
import * as ACT_EVENTS from './act';
import * as MOVEMENT_EVENTS from './movement';

export const EVENTS = {
    ACT: ACT_EVENTS,
    MOVEMENT: MOVEMENT_EVENTS
}

export default new PubSub();
