import { Router } from "express";
import {
  getUserById,
  getUsers,
  getCurrentUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/me", authorize, getCurrentUser);

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUserById);

/* userRouter.post("/", (req, res) => {
  res.send({ title: "Creating a user" });
}); */

userRouter.put("/:id", (req, res) => {
  res.send({ title: "Updating user" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ title: "Deleting user" });
});

export default userRouter;
