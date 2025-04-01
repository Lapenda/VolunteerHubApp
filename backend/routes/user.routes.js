import { Router } from "express";
import { getUser, getUsers } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.post("/", (req, res) => {
  res.send({ title: "Creating a user" });
});

userRouter.put("/:id", (req, res) => {
  res.send({ title: "Updating user" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ title: "Deleting user" });
});

export default userRouter;
