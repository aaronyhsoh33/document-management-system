import "dotenv/config";
import { defineConfig } from "prisma/config";

const { PG_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DB, DATABASE_URL } = process.env;

const dbUrl = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
