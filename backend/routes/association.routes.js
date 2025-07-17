import { Router } from "express";
import {
  followAssociation,
  unfollowAssociation,
  getAssociation,
} from "../controllers/association.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const associationRouter = Router();

associationRouter.post("/:associationId/follow", authorize, followAssociation);
associationRouter.delete(
  "/:associationId/follow",
  authorize,
  unfollowAssociation
);
associationRouter.get("/:associationId", getAssociation);

export default associationRouter;
