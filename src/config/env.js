import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: process.env.JWT_ISSUER ?? "localcloud",
  jwtAudience: process.env.JWT_AUDIENCE ?? "localcloud-api",
};
if (!env.databaseUrl) throw new Error("DATABASE_URL is required");
if (!env.jwtSecret) throw new Error("JWT_SECRET is required");
