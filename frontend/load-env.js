#!/usr/bin/env node

/**
 * Load environment variables from .env.local before any Prisma operations
 * This script must be run before Next.js starts
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
  
  console.log('✅ .env.local loaded successfully');
  console.log('📝 DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'NOT SET');
} else {
  console.warn('⚠️ .env.local not found');
}

module.exports = {
  loadEnv: () => {
    // Already loaded above
  }
};
