
import { z } from 'zod';

const createPostZodSchema = z.object({
  body: z.object({
    createdBy: z.string({ required_error: 'first name is required' }),
    title: z.string({ required_error: 'last name is required' }),
    description: z.string({ required_error: 'Email is required' }),
    amount: z.string({ required_error: 'Password is required' }),
    work_time: z.string({ required_error: "you must give the worktime"}),
    deadline: z.string({ required_error: "you must give your deadline"}),
    location: z.any({ required_error: "you must give the location data"}),
    lat: z.any({ required_error: "you must give the location data"}),
    lon: z.any({ required_error: "you must give the location data"}),
    image: z.any({ required_error: "you must give the image to upload a post"})
  })
});

const updatePostZodSchema = z.object({
  body: z.object({
    postId: z.string({required_error: "you must give the post id to update the post!"}),
    createdBy: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    amount: z.string().optional(),
    work_time: z.string().optional(),
    deadline: z.string().optional(),
    location: z.any().optional(),
    lat: z.any().optional(),
    lan: z.any().optional(),
    image: z.any().optional()
  })
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  user_name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const PostValidation = {
  createPostZodSchema,
  updateUserZodSchema,
  updatePostZodSchema
};
