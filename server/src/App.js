import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// import { ApiError } from "./common/utils/api-error.js";
import ApiError from "./common/utils/api-error.js";
import authRoute from "./modules/auth/auth.routes.js";
// import pollRoute from "./modules/poll/poll.route.js";
import pollRoute from "./modules/poll/poll.route.js"
import responseRoute from "./modules/response/response.route.js";
import analyticsRoute from "./modules/analytics/analytics.route.js";



const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/poll", pollRoute);
app.use("/api/response", responseRoute);
app.use("/api/analytics", analyticsRoute);


app.get("/", (req, res) => {
  res.send("SmartPoll API Running ");



  // Catch-all for undefined routes
app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});
});

export default app;

