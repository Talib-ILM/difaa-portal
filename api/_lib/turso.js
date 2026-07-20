import { connect } from "@tursodatabase/serverless";

export function getTurso() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}
