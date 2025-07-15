import { Router } from "express";
import {
  createEvent,
  searchEvents,
  registerForEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} from "../controllers/event.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const eventRouter = Router();

eventRouter.post("/", authorize, createEvent);
eventRouter.get("/", searchEvents);
eventRouter.get("/:eventId", authorize, getEventById);
eventRouter.post("/:eventId/register", authorize, registerForEvent);
eventRouter.put("/:eventId", authorize, updateEvent);
eventRouter.delete("/:eventId", authorize, deleteEvent);

export default eventRouter;
