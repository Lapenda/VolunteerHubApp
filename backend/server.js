import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import { getConfig } from "./services/config.service.js";
import { updateConfig } from "./services/config.service.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(errorMiddleware);
app.use(arcjetMiddleware);

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
  res.send("Wellcome to VolunteerHub app!");
});

async function run() {
  try {
    const config = getConfig();
    const port = config.server?.port || PORT;
    app.listen(port, async () => {
      console.log(`Server is running on port ${port}`);
      await connectToDatabase();
    });
  } catch (err) {
    console.log(err);
  }
}

run().catch(console.dir);

app.get("/api/v1/config/test", (req, res) => {
  const success = updateConfig("server", "port", 6000);
  res.json({ success, message: "Port updated" });
});

export default app;
