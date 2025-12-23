/**
 * Environment Configuration Validator
 * Runs at application startup to ensure all required variables are present
 */

// List of required environment variables that MUST be set for production
const REQUIRED_ENV_VARS = [
  // Database
  'DATABASE_URL',

  // Firebase
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',

  // AI Services (core)
  'GEMINI_API_KEY',

  // Payments
  'MERCADOPAGO_ACCESS_TOKEN',

  // Redis/Cache
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

// List of optional environment variables - features work in degraded mode without these
const OPTIONAL_ENV_VARS = [
  // Image processing - only needed for image tools
  { name: 'CLOUDINARY_CLOUD_NAME', default: '' },
  { name: 'CLOUDINARY_API_KEY', default: '' },
  { name: 'CLOUDINARY_API_SECRET', default: '' },

  // R2 Storage - only needed for file uploads
  { name: 'R2_ENDPOINT', default: '' },
  { name: 'R2_ACCESS_KEY_ID', default: '' },
  { name: 'R2_SECRET_ACCESS_KEY', default: '' },
  { name: 'R2_BUCKET_NAME', default: '' },

  // Feature flags
  { name: 'CREDIT_COST_ANALYSIS', default: '1' },
  { name: 'CREDIT_COST_GENERATION', default: '1' },
  { name: 'ENFORCE_CREDITS', default: 'true' },
  { name: 'RATE_LIMIT_ENABLED', default: 'true' },
  { name: 'CACHE_ENABLED', default: 'true' },
  { name: 'MODERATION_ENABLED', default: 'true' },
  { name: 'WATERMARK_ENABLED', default: 'true' },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate that all required environment variables are configured
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }

  // Check optional variables and warn if not configured
  for (const { name } of OPTIONAL_ENV_VARS) {
    const value = process.env[name];
    if (!value) {
      warnings.push(`${name} not configured, using default value`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Throw error if validation fails - useful for startup validation
 */
export function assertEnvironment(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    const missingList = result.missing.map((v) => `  - ${v}`).join('\n');
    throw new Error(
      `\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:\n${missingList}\n\n` +
      `Please check your .env.local or deployment environment configuration.\n` +
      `See frontend/.env.example for all required variables.`
    );
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    result.warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  console.log('✅ Environment validation passed');
}
