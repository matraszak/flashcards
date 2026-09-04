import type { FastifyInstance } from "fastify";
import { CreateDeck } from "shared";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.js";
import { decks } from "../db/schema.js";

export async function deckRoutes(app: FastifyInstance) {
  // GET /api/decks
  app.get("/api/decks", async () => {
    return db.select().from(decks);
  });

  // POST /api/decks
  app.post("/api/decks", async (request, reply) => {
    const result = CreateDeck.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const now = new Date();

    const [deck] = await db
      .insert(decks)
      .values({
        id: randomUUID(),
        name: result.data.name,
        description: result.data.description ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      })
      .returning();

    return reply.status(201).send(deck);
  });
}
