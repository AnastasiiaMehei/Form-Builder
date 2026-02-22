import * as yup from "yup";

// Common validation schemas

export const emailSchema = yup
  .string()
  .email("Invalid email")
  .required("Email is required");

export const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters long")
  .matches(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .matches(/[0-9]/, "Password must contain at least one digit")
  .required("Password is required");

export const usernameSchema = yup
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be no more than 20 characters long")
  .matches(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
  .required("Username is required");

export const phoneSchema = yup
  .string()
  .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .optional();

// Form schemas

export const registerSchema = yup.object().shape({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: yup.string().required("Password is required"),
});

export const profileSchema = yup.object().shape({
  username: usernameSchema,
  email: emailSchema,
  phone: phoneSchema,
  firstName: yup.string().min(2, "Minimum 2 characters").optional(),
  lastName: yup.string().min(2, "Minimum 2 characters").optional(),
});

// Type exports for TypeScript
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;
