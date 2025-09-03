import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
import path from "path";
import passport from "passport";
import { setupSwagger } from "./config/swagger";
import routes from "./routes";
import "./config/passport";
import errorHandler from "./middleware/errorHandler";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : undefined,
  quiet: process.env.NODE_ENV === "test",
});

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(passport.initialize());
setupSwagger(app);

app.use("/api", routes);

app.use(errorHandler);

export default app;
