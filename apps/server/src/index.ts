import Fastify from "fastify";
import { deckRoutes } from "./routes/decks.js";

const app = Fastify({
  logger: true,
});

app.register(deckRoutes);

app.listen({
  port: 3000,
  host: "0.0.0.0",
});
