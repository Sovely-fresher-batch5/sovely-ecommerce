import { z } from 'zod';

const optionalTrimmed = z.string().trim().optional();

const optionalBusinessString = z
    .string()
    .trim()
    .optional()
    .refine((value) => value === undefined || value.length <= 100, {
        message: 'Must be at most 100 characters',
    });

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

export const userValidation = {
    updateMyProfile: z.object({
        body: z.object({
            name: z
                .string()
                .trim()
                .min(2, 'Name must be at least 2 characters')
                .max(60, 'Name must be at most 60 characters')
                .regex(/^[A-Za-z][A-Za-z .'-]*$/, 'Name can contain only letters and spaces'),
            email: z.string().trim().email('Please provide a valid email address').optional(),
            companyName: optionalBusinessString,
            gstin: optionalTrimmed.refine(
                (value) =>
                    value === undefined ||
                    value === '' ||
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z0-9][0-9A-Z]$/.test(
                        value.toUpperCase()
                    ),
                {
                    message: 'Invalid GSTIN format',
                }
            ),
            panNumber: z.string().trim().optional(),
            entityType: z.string().trim().optional(),
            industry: z.string().trim().optional(),
            website: z.string().trim().optional(),
            yearEstablished: z.string().trim().optional(),
            billingAddress: z
                .object({
                    street: z
                        .string()
                        .trim()
                        .max(200, 'Street address must be at most 200 characters')
                        .optional(),
                    city: z
                        .string()
                        .trim()
                        .optional()
                        .refine(
                            (value) =>
                                value === undefined ||
                                value === '' ||
                                /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(value),
                            { message: 'City must be 2-60 letters only' }
                        ),
                    state: z
                        .string()
                        .trim()
                        .optional()
                        .refine(
                            (value) =>
                                value === undefined ||
                                value === '' ||
                                /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(value),
                            { message: 'State must be 2-60 letters only' }
                        ),
                    zip: z
                        .string()
                        .trim()
                        .optional()
                        .refine(
                            (value) =>
                                value === undefined ||
                                value === '' ||
                                /^[1-9][0-9]{5}$/.test(value),
                            { message: 'PIN code must be a valid 6-digit Indian PIN' }
                        ),
                })
                .optional(),
            bankDetails: z
                .object({
                    accountName: z.string().trim().max(100, 'Account name must be at most 100 characters').optional(),
                    accountNumber: z.string().trim().max(50, 'Account number must be at most 50 characters').optional(),
                    ifscCode: z.string().trim().max(20, 'IFSC must be at most 20 characters').optional(),
                    bankName: z.string().trim().max(100, 'Bank name must be at most 100 characters').optional(),
                })
                .optional(),
            emailNotifications: z.boolean().optional(),
            orderSms: z.boolean().optional(),
            promotionalEmails: z.boolean().optional(),
        }),
    }),

    updatePassword: z.object({
        body: z.object({
            oldPassword: z.string().min(1, 'Current password is required').max(128),
            newPassword: z
                .string()
                .min(8, 'New password must be at least 8 characters')
                .max(64, 'New password must be at most 64 characters')
                .regex(
                    strongPasswordRegex,
                    'Password must include uppercase, lowercase, number, and special character'
                ),
        }),
    }),
};
