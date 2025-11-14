import { z } from 'zod';

// Password validation: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number");

// Email validation with length constraints
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

// User management validation schemas
export const userSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
});

export const userSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  department: z
    .string()
    .trim()
    .max(100, "Department must be less than 100 characters")
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'security_analyst', 'employee']),
  security_clearance_level: z.number().int().min(1).max(10),
});

export const updateUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .optional(),
  department: z
    .string()
    .trim()
    .max(100, "Department must be less than 100 characters")
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'security_analyst', 'employee']).optional(),
  security_clearance_level: z.number().int().min(1).max(10).optional(),
});
