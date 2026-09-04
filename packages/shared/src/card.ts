import { z } from "zod";

export const CreateCard = z.object({
  position: z.number().int().nonnegative(),
  frontText: z.string().min(1),
  backText: z.string().min(1),
  frontImageId: z.uuid().nullable().optional(),
  backImageId: z.uuid().nullable().optional(),
});

export const UpdateCard = z.object({
  position: z.number().int().nonnegative().optional(),
  frontText: z.string().min(1).optional(),
  backText: z.string().min(1).optional(),
  frontImageId: z.uuid().nullable().optional(),
  backImageId: z.uuid().nullable().optional(),
});

export const Card = z.object({
  id: z.uuid(),
  deckId: z.uuid(),
  position: z.number(),
  frontText: z.string(),
  backText: z.string(),
  frontImageId: z.uuid().nullable(),
  backImageId: z.uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreateCard = z.infer<typeof CreateCard>;
export type UpdateCard = z.infer<typeof UpdateCard>;
export type Card = z.infer<typeof Card>;
