import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    first_name: z.string({ required_error: 'first name is required' }),
    last_name: z.string({ required_error: 'last name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' })
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    user_name: z.string().optional(),
    contact: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    gender: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    dob: z.string().optional(),
    skills: z.array( z.string()).optional()
  })
});

const createReportRequestZodSchema = z.object({
  body: z.object({
    title: z.string({required_error: "You must give the title of this task!"}),
    description: z.string({required_error: "you must give the description of the report"}),
    image: z.any({required_error: "You must give the image of your problem!"})
  })
});

const filterDataZodSchema = z.object({
  body: z.object({
    userLat: z.number({required_error: "You must give the user lan number"}),
    userLng: z.number({required_error: "you must give lng number"}),
    maxDistance: z.number({required_error: "You must give the max distance"}),
    minPrice: z.number({required_error: "You must give the min price"}),
    maxPrice: z.number({required_error: "You must give the max price"})
  })
});

const giveReviewZodSchema = z.object({
  body: z.object({
    user_id: z.string({required_error: "You must give the user id!"}),
    star: z.number({required_error: "You must give the star number!"}),
    comment: z.string({required_error: "You must give the comment!"}),
    // from: z.string({required_error: "You must give the from!"})
  })
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  createReportRequestZodSchema,
  filterDataZodSchema,
  giveReviewZodSchema
};
