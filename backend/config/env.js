import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  EMAIL_USER,
  EMAIL_PASS,
  OPENWEATHER_API_KEY,
  ETHEREAL_USERNAME,
  ETHEREAL_PASS,
  ETHEREAL_HOST,
  ETHEREAL_PORT,
} = process.env;
