import type { FastifyInstance } from "fastify";
import { CreateDeck, CreateCard, UpdateCard } from "shared";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { decks, cards } from "../db/schema.js";

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

  // GET /api/decks/:id
  app.get("/api/decks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id));

    if (!deck) {
      return reply.status(404).send({
        error: "Deck not found",
      });
    }

    return reply.status(200).send(deck);
  });

  // PATCH /api/decks/:id
  app.patch("/api/decks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = CreateDeck.partial().safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id));

    if (!deck) {
      return reply.status(404).send({
        error: "Deck not found",
      });
    }

    const [updatedDeck] = await db
      .update(decks)
      .set({
        ...result.data,
        updatedAt: new Date(),
        version: deck.version + 1,
      })
      .where(eq(decks.id, id))
      .returning();

    return reply.status(200).send(updatedDeck);
  });

  // DELETE /api/decks/:id
  app.delete("/api/decks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id));

    if (!deck) {
      return reply.status(404).send({
        error: "Deck not found",
      });
    }

    await db
      .delete(decks)
      .where(eq(decks.id, id));

    return reply.status(204).send();
  });

  // GET /api/decks/:id/cards
  app.get("/api/decks/:id/cards", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id));

    if (!deck) {
      return reply.status(404).send({
        error: "Deck not found",
      });
    }

    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, id));

    return reply.status(200).send(deckCards);
  });

    // POST /api/decks/:id/cards
  app.post("/api/decks/:id/cards", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, id));

    if (!deck) {
      return reply.status(404).send({
        error: "Deck not found",
      });
    }

    const result = CreateCard.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const now = new Date();

    const [card] = await db
      .insert(cards)
      .values({
        id: randomUUID(),
        deckId: id,
        position: result.data.position,
        frontText: result.data.frontText,
        backText: result.data.backText,
        frontImageId: result.data.frontImageId ?? null,
        backImageId: result.data.backImageId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return reply.status(201).send(card);
  });

  // PATCH /api/cards/:id
  app.patch("/api/cards/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = UpdateCard.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const [card] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));

    if (!card) {
      return reply.status(404).send({
        error: "Card not found",
      });
    }

    // Check for change -> if no, then normal update
    if (
      result.data.position === undefined ||
      result.data.position === card.position
    ) {
      const [updatedCard] = await db
        .update(cards)
        .set({
          ...result.data,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, id))
        .returning();

      return reply.status(200).send(updatedCard);
    }

    const oldPosition = card.position;
    const newPosition = result.data.position;

    // Check if new position is valid
    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, card.deckId));

    const maxPosition = deckCards.length - 1;

    if (newPosition < 0 || newPosition > maxPosition) {
      return reply.status(400).send({
        error: "Invalid position",
      });
    }

    // Move up
    if (newPosition > oldPosition) {
      await db
        .update(cards)
        .set({
          position: oldPosition,
        })
        .where(eq(cards.id, id));

      for (const otherCard of deckCards) {
        if (
          otherCard.id !== id &&
          otherCard.position > oldPosition &&
          otherCard.position <= newPosition
        ) {
          await db
            .update(cards)
            .set({
              position: otherCard.position - 1,
            })
            .where(eq(cards.id, otherCard.id));
        }
      }

      await db
        .update(cards)
        .set({
          position: newPosition,
          frontText: result.data.frontText ?? card.frontText,
          backText: result.data.backText ?? card.backText,
          frontImageId:
            result.data.frontImageId !== undefined
              ? result.data.frontImageId
              : card.frontImageId,
          backImageId:
            result.data.backImageId !== undefined
              ? result.data.backImageId
              : card.backImageId,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, id));
    }

    // Move down
    if (newPosition < oldPosition) {
      await db
        .update(cards)
        .set({
          position: oldPosition,
        })
        .where(eq(cards.id, id));

      for (const otherCard of deckCards) {
        if (
          otherCard.id !== id &&
          otherCard.position >= newPosition &&
          otherCard.position < oldPosition
        ) {
          await db
            .update(cards)
            .set({
              position: otherCard.position + 1,
            })
            .where(eq(cards.id, otherCard.id));
        }
      }

      await db
        .update(cards)
        .set({
          position: newPosition,
          frontText: result.data.frontText ?? card.frontText,
          backText: result.data.backText ?? card.backText,
          frontImageId:
            result.data.frontImageId !== undefined
              ? result.data.frontImageId
              : card.frontImageId,
          backImageId:
            result.data.backImageId !== undefined
              ? result.data.backImageId
              : card.backImageId,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, id));
    }

    const [updatedCard] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));

    return reply.status(200).send(updatedCard);
  });


  // DELETE /api/cards/:id
  app.delete("/api/cards/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [card] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));

    if (!card) {
      return reply.status(404).send({
        error: "Card not found",
      });
    }

    await db
      .delete(cards)
      .where(eq(cards.id, id));

    return reply.status(204).send();
  });
}
