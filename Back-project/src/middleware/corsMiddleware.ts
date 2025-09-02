import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const origin = process.env.FRONTEND_URL || "http://localhost:5000";

const corsOptions = {
  origin,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
