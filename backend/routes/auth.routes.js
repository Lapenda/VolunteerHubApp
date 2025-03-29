import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", (req, res) => {
  res.send("User signed up!");
});

authRouter.post("/login", (req, res) => {
  res.send("User logged in!");
});

authRouter.post("/logout", (req, res) => {
  res.send("User logged out!");
});

export default authRouter;
