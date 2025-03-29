import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Wellcome to VolunteerHub app!");
});

async function run() {
  try {
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      await connectToDatabase();
    });
  } catch (err) {
    console.log(err);
  }
}

run().catch(console.dir);

export default app;
