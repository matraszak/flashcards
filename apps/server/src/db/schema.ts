import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const decks = sqliteTable("decks", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),

  description: text("description"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  version: integer("version").notNull().default(1),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id),

  position: integer("position").notNull(),

  frontText: text("front_text").notNull(),

  backText: text("back_text").notNull(),

  frontImageId: integer("front_image_id"),

  backImageId: integer("back_image_id"),

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
