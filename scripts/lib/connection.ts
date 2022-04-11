import pg from "pg";

export function getClient(): pg.Client {
  return new pg.Client({
    user: "postgres",
    password: "postgrespassword",
    host: "localhost",
    port: 5432,
    database: "postgres",
  });
}
