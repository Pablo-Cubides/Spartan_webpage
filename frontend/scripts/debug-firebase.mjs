#!/usr/bin/env node
/**
 * Firebase Authentication Debug Script
 * Run with: node scripts/debug-firebase.mjs
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

console.log('\n🔥 Firebase Configuration Debug\n');
console.log('='.repeat(60));

// Check environment variables
const envVars = {
  'API Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'Auth Domain': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'Project ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'Storage Bucket': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'Messaging Sender ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'App ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('\n📋 Environment Variables:\n');

let allValid = true;
for (const [name, value] of Object.entries(envVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = name === 'API Key' 
      ? value.substring(0, 15) + '...' + value.substring(value.length - 5)
      : value;
    console.log(`  ✅ ${name}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${name}: NOT SET`);
    allValid = false;
  }
}

console.log('\n' + '='.repeat(60));

// Parse the App ID to extract project number
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
if (appId) {
  const match = appId.match(/^1:(\d+):web:/);
  if (match) {
    console.log(`\n📊 Project Number (from App ID): ${match[1]}`);
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n🔧 SOLUTION - Enable Identity Toolkit API:\n');
console.log('The error indicates the Identity Toolkit API is not enabled.');
console.log('Follow these steps to fix it:\n');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';

console.log('1. Go to Google Cloud Console:');
console.log(`   https://console.cloud.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=${projectId}\n`);

console.log('2. Click "ENABLE" button\n');

console.log('3. Also enable these APIs (if not already):');
console.log(`   - Token Service API: https://console.cloud.google.com/apis/api/securetoken.googleapis.com/overview?project=${projectId}`);
console.log(`   - Firebase Auth API: https://console.cloud.google.com/apis/api/firebaseauth.googleapis.com/overview?project=${projectId}\n`);

console.log('4. Go to Firebase Console and enable Authentication:');
console.log(`   https://console.firebase.google.com/project/${projectId}/authentication/providers\n`);

console.log('5. Enable the sign-in methods you need:');
console.log('   - Email/Password');
console.log('   - Google (for Google Sign-In)\n');

console.log('6. Restart your Next.js dev server after enabling the APIs\n');

console.log('='.repeat(60));
console.log('\n✨ After enabling, wait 2-3 minutes for propagation, then try again.\n');
