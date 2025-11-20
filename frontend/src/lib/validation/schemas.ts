/**
 * Validation Schemas for API Endpoints
 * Using Zod for runtime type validation
 */

import { z } from 'zod';

// ============================================
// Credits API Schemas
// ============================================

export const BuyCreditSchema = z.object({
  package_id: z.number().int().positive('Package ID debe ser un número positivo'),
  back_urls: z.object({
    success: z.string().url('Success URL debe ser válida').optional(),
    failure: z.string().url('Failure URL debe ser válida').optional(),
  }).optional(),
});

export type BuyCredit = z.infer<typeof BuyCreditSchema>;

// ============================================
// Blog API Schemas
// ============================================

export const CreateBlogPostSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  content: z.string()
    .min(10, 'El contenido debe tener al menos 10 caracteres'),
  excerpt: z.string()
    .max(500, 'El extracto no puede exceder 500 caracteres')
    .optional(),
  cover_image: z.string().url('URL de imagen debe ser válida').optional(),
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(100, 'El slug no puede exceder 100 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug debe contener solo minúsculas, números y guiones'),
  is_published: z.boolean().optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial();

export type CreateBlogPost = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof UpdateBlogPostSchema>;

// ============================================
// Users API Schemas
// ============================================

export const UpdateUserProfileSchema = z.object({
  email: z.string().email('Email no válido').optional(),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  alias: z.string()
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(50, 'El alias no puede exceder 50 caracteres')
    .regex(/^[a-z0-9_]+$/, 'El alias solo puede contener minúsculas, números y guiones bajos')
    .optional(),
  avatar_id: z.string().optional(),
});

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'moderator'], {
    errorMap: () => ({ message: 'El rol debe ser: user, admin o moderator' })
  }),
  userId: z.number().int().positive('El ID del usuario debe ser un número positivo').optional(),
});

export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserRole = z.infer<typeof UpdateUserRoleSchema>;

// ============================================
// Image Upload Schemas
// ============================================

export const ImageUploadSchema = z.object({
  filename: z.string()
    .min(1, 'El nombre del archivo es requerido')
    .max(255, 'El nombre del archivo es muy largo'),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
    .optional(),
});

export type ImageUpload = z.infer<typeof ImageUploadSchema>;

// ============================================
// Asesor Estilo Schemas
// ============================================

export const AnalyzeImageSchema = z.object({
  imageUrl: z.string().url('URL de imagen debe ser válida'),
  locale: z.enum(['es', 'en']).optional(),
  sessionId: z.string().optional(),
});

export const IterateImageSchema = z.object({
  originalImageUrl: z.string().url('URL de imagen original debe ser válida'),
  userText: z.string().optional(),
  analysis: z.object({
    suggestedText: z.string().optional(),
  }).optional(),
  prevPublicId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type AnalyzeImage = z.infer<typeof AnalyzeImageSchema>;
export type IterateImage = z.infer<typeof IterateImageSchema>;

// ============================================
// Helper function for validation
// ============================================

/**
 * Validates data against a schema and throws error if invalid
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    
    throw new Error(`Validation error: ${errors}`);
  }
  
  return result.data;
}
