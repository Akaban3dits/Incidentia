import path from "path";
import dotenv from "dotenv";

process.env.NODE_ENV = "test";
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

process.env.JWT_SECRET ||= "test-secret";
delete process.env.JWT_ISSUER;
delete process.env.JWT_AUDIENCE;
