import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const decks = sqliteTable("decks", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  description: text("description"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  version: integer("version").notNull().default(1),
});

export const cards = sqliteTable("cards", {
  id: text("id").primaryKey(),

  deckId: text("deck_id")
    .notNull()
    .references(() => decks.id),

  position: integer("position").notNull(),

  frontText: text("front_text").notNull(),

  backText: text("back_text").notNull(),

  frontImageId: text("front_image_id"),

  backImageId: text("back_image_id"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
}));
