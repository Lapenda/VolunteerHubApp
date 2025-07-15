import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";
import volunteerRouter from "./routes/volunteer.routes.js";
import associationRouter from "./routes/association.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import { getConfig } from "./services/config.service.js";
import { updateConfig } from "./services/config.service.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:4200" }));
app.use(arcjetMiddleware);
app.use(errorMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/volunteers", volunteerRouter);
app.use("/api/v1/associations", associationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to VolunteerHub app!");
});

app.get("/api/v1/config/test", (req, res) => {
  const success = updateConfig("server", "port", 6000);
  res.json({ success, message: "Port updated" });
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

export default app;
