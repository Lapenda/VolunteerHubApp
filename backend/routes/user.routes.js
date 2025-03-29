import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.send({ title: "Get all users" });
});

userRouter.get("/:id", (req, res) => {
  res.send({ title: "Getting one user" });
});

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
