import { z } from "zod";

/**
 * Zod schema for validating task creation input.
 * - title: required string, 1–255 characters
 * - status: optional enum ('todo' | 'in-progress' | 'done')
 * - priority: optional enum ('low' | 'medium' | 'high')
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or fewer"),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

/**
 * Zod schema for validating task update input.
 * All fields are optional, but at least one field must be provided.
 * - title: optional string, 1–255 characters if present
 * - status: optional enum ('todo' | 'in-progress' | 'done')
 * - priority: optional enum ('low' | 'medium' | 'high')
 */
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title must be at least 1 character")
      .max(255, "Title must be 255 characters or fewer")
      .optional(),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined,
    { message: "At least one field must be provided for update" }
  );
