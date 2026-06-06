import { z } from "zod";

const createDepositZodSchema = z.object({
    body: z.object({
        amount: z.number({ required_error: "You must give the amount" })
    })
})

const createWithdrawZodSchema = z.object({
    body: z.object({
        amount: z.number({ required_error: "You must give the amount" })
    })
})

export const PaymentValidation = {
    createDepositZodSchema,
    createWithdrawZodSchema
};