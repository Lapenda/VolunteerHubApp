import { Router } from "express";
import { getVolunteerByUserId } from "../controllers/volunteer.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const volunteerRouter = Router();

volunteerRouter.get("/by-user/:userId", authorize, getVolunteerByUserId);

export default volunteerRouter;
