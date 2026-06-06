import { z } from 'zod';

const createChatZodSchema = z.object({
  body: z.object({
    receiver: z.string({ required_error: 'You must give the receiver id to start the caht!' })
  }),
});

const allChatZodSchema = z.object({
  body: z.object({
    page: z.number().optional(),
    limit: z.number().optional()
  }),
});

const getChatWithIdZodSchema = z.object({
  body: z.object({
    chatId: z.string({ required_error: 'Get chat wiht id! was not founded!' })
  }),
});

export const ChatValidation = {
  createChatZodSchema,
  getChatWithIdZodSchema,
  allChatZodSchema
};
