import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  text: z.string().min(1, "Question text cannot be empty"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "A question must have at least two options"),
  correctOptionIndex: z.number().min(0, "Correct option index must be valid"),
});

export const QuizConfigSchema = z.object({
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  maxAttempts: z.number().min(1, "Max attempts must be at least 1"),
  questions: z.array(QuestionSchema),
});

export type QuizConfig = z.infer<typeof QuizConfigSchema>;
export type Question = z.infer<typeof QuestionSchema>;
