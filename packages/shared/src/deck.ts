import { z } from "zod";

export const CreateDeck = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});

export const UpdateDeck = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export const Deck = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  version: z.number(),
});

export type CreateDeck = z.infer<typeof CreateDeck>;
export type UpdateDeck = z.infer<typeof UpdateDeck>;
export type Deck = z.infer<typeof Deck>;
