const dotenv = require("dotenv");

dotenv.config();

const required = ["DATABASE_URL"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const jwtAccessSecret =
  process.env.JWT_ACCESS_SECRET || "change-this-secret-in-production";

if (isProduction && jwtAccessSecret === "change-this-secret-in-production") {
  throw new Error("JWT_ACCESS_SECRET must be configured in production");
}

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL || "info",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwt: {
    accessSecret: jwtAccessSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  },
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  },
};

export {};
