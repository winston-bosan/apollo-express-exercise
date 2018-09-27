import { PubSub } from "apollo-server";
import * as ACT_EVENTS from "./act";
import * as MOVEMENT_EVENTS from "./movement";
import * as LIST_EVENTS from "./list";

export const EVENTS = {
  ACT: ACT_EVENTS,
  MOVEMENT: MOVEMENT_EVENTS,
  LIST: LIST_EVENTS
};

export default new PubSub();
