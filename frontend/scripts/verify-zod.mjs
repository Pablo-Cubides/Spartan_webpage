#!/usr/bin/env node

/**
 * Verifica que Zod esté instalado y luego ejecuta tests de validación
 * This script validates that Zod is properly installed and tests the schemas
 */

import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function checkDependencies() {
  log('\n📦 Verificando dependencias necesarias...', 'blue');

  try {
    await import('zod');
    log('✅ Zod está instalado', 'green');
  } catch (err) {
    log('❌ Zod NO está instalado', 'red');
    log('\nInstalando Zod...', 'yellow');
    try {
      execSync('npm install zod', { stdio: 'inherit' });
      log('✅ Zod instalado exitosamente', 'green');
    } catch (e) {
      log('❌ Error instalando Zod', 'red');
      process.exit(1);
    }
  }
}

async function validateSchemas() {
  log('\n📝 Validando Zod schemas...', 'blue');

  try {
    // Dynamically import zod
    const { z } = await import('zod');

    // Define schemas inline for testing
    const BuyCreditSchema = z.object({
      package_id: z.number().int().positive('El ID del paquete debe ser un número positivo')
    });

    const CreateBlogPostSchema = z.object({
      title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
      slug: z.string()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug debe estar en minúsculas sin espacios'),
      content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
      excerpt: z.string().optional(),
      featured_image: z.string().url().optional(),
      published: z.boolean().default(false)
    });

    const UpdateUserProfileSchema = z.object({
      name: z.string().min(2).optional(),
      alias: z.string()
        .regex(/^[a-z0-9_]+$/, 'El alias debe contener solo letras minúsculas, números y guiones bajos')
        .optional(),
      bio: z.string().max(500).optional(),
      avatar_url: z.string().url().optional()
    }).strict();

    const AnalyzeImageSchema = z.object({
      imageUrl: z.string().url('Debe ser una URL válida'),
      locale: z.enum(['es', 'en']).default('es')
    });

    // Test 1: Valid BuyCredit
    try {
      BuyCreditSchema.parse({ package_id: 5 });
      log('✅ BuyCreditSchema: datos válidos aceptados', 'green');
    } catch (err) {
      throw new Error('BuyCreditSchema: válidos rechazados');
    }

    // Test 2: Invalid BuyCredit
    try {
      BuyCreditSchema.parse({ package_id: 'invalid' });
      throw new Error('BuyCreditSchema: debería haber rechazado package_id inválido');
    } catch (e) {
      if (e instanceof z.ZodError) {
        log('✅ BuyCreditSchema: datos inválidos rechazados correctamente', 'green');
      } else {
        throw e;
      }
    }

    // Test 3: Valid BlogPost
    try {
      CreateBlogPostSchema.parse({
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is a valid blog post content that is long enough'
      });
      log('✅ CreateBlogPostSchema: datos válidos aceptados', 'green');
    } catch (err) {
      throw new Error('CreateBlogPostSchema: válidos rechazados - ' + err.message);
    }

    // Test 4: Invalid BlogPost slug
    try {
      CreateBlogPostSchema.parse({
        title: 'Test Post',
        slug: 'Test With Spaces',
        content: 'Valid content here'
      });
      throw new Error('CreateBlogPostSchema: debería haber rechazado slug inválido');
    } catch (e) {
      if (e instanceof z.ZodError) {
        log('✅ CreateBlogPostSchema: slug inválido rechazado', 'green');
      } else {
        throw e;
      }
    }

    // Test 5: Valid UserProfile
    try {
      UpdateUserProfileSchema.parse({
        name: 'John Doe',
        alias: 'john_doe'
      });
      log('✅ UpdateUserProfileSchema: datos válidos aceptados', 'green');
    } catch (err) {
      throw new Error('UpdateUserProfileSchema: válidos rechazados');
    }

    // Test 6: Valid AnalyzeImage
    try {
      AnalyzeImageSchema.parse({
        imageUrl: 'https://example.com/image.jpg',
        locale: 'es'
      });
      log('✅ AnalyzeImageSchema: datos válidos aceptados', 'green');
    } catch (err) {
      throw new Error('AnalyzeImageSchema: válidos rechazados');
    }

    // Test 7: Invalid AnalyzeImage URL
    try {
      AnalyzeImageSchema.parse({
        imageUrl: 'not-a-url',
        locale: 'es'
      });
      throw new Error('AnalyzeImageSchema: debería haber rechazado URL inválida');
    } catch (e) {
      if (e instanceof z.ZodError) {
        log('✅ AnalyzeImageSchema: URL inválida rechazada', 'green');
      } else {
        throw e;
      }
    }

    log('\n✅ Todas las validaciones de Zod pasaron correctamente!', 'green');
    return true;

  } catch (error) {
    log('\n❌ Error en validaciones: ' + error.message, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 Iniciando verificación de validaciones Zod...', 'blue');
  
  await checkDependencies();
  const success = await validateSchemas();

  if (success) {
    log('\n✅ Todas las pruebas pasaron!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Algunas pruebas fallaron', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log('\n❌ Error fatal: ' + error.message, 'red');
  process.exit(1);
});
