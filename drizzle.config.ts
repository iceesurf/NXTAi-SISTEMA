// drizzle.config.ts
import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./server/db/schema.ts", // ou o caminho real do seu schema
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: false, // ESSENCIAL para Railway com certificado self-signed
    },
  },
} satisfies Config;