import { z } from 'zod';

const sendMessage = z.object({
  body: z.object({
    chatID: z.string({ required_error: 'you must give the chat id to send the mesage!' }),
    content: z.string().optional(),
    image: z.string().optional(),
    // typeOf: z.enum(["MESSAGE" , "IMAGE"]).optional()
  }),
});


const getAllMessages = z.object({
  body: z.object({
    chatId: z.string({ required_error: "You must give the chat id!"}),
    page: z.number().optional(),
    limit: z.number().optional()
  })
})


export const MessageValidation = {
  sendMessage,
  getAllMessages
};
