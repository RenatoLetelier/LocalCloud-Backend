import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: process.env.JWT_ISSUER ?? "localcloud",
  jwtAudience: process.env.JWT_AUDIENCE ?? "localcloud-api",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  // Static password used by this server to authenticate against the external media API
  mediaPassword: process.env.MEDIA_PASSWORD,
};

if (!env.databaseUrl) throw new Error("DATABASE_URL is required");
if (!env.jwtSecret) throw new Error("JWT_SECRET is required");
