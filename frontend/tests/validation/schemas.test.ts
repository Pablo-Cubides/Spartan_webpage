/**
 * Tests for Zod Validation Schemas
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export async function runZodValidationTests() {
  console.log('🚀 Testing Zod Validation Schemas...');

  try {
    const { 
      BuyCreditSchema, 
      CreateBlogPostSchema, 
      UpdateUserProfileSchema,
      AnalyzeImageSchema,
      validateData
    } = await import('../../src/lib/validation/schemas');

    console.log('\n1. Testing BuyCreditSchema');
    
    // Valid case
    try {
      const validData = { package_id: 5 };
      const result = validateData(BuyCreditSchema, validData);
      console.log('   ✅ Valid data accepted:', result);
    } catch {
      throw new Error('Valid BuyCreditSchema rejected');
    }

    // Invalid case - should throw
    try {
      validateData(BuyCreditSchema, { package_id: 'invalid' });
      throw new Error('Invalid package_id should have failed');
    } catch (err) {
      if ((err as Error).message.includes('Validation error')) {
        console.log('   ✅ Invalid package_id rejected correctly');
      } else {
        throw err;
      }
    }

    console.log('\n2. Testing CreateBlogPostSchema');
    
    // Valid case
    try {
      const validData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content that is long enough'
      };
      validateData(CreateBlogPostSchema, validData);
      console.log('   ✅ Valid blog post accepted');
    } catch (e) {
      throw new Error('Valid CreateBlogPostSchema rejected: ' + (e as Error).message);
    }

    // Invalid slug
    try {
      validateData(CreateBlogPostSchema, {
        title: 'Test',
        slug: 'Test With Spaces', // Invalid: uppercase and spaces
        content: 'Valid content here'
      });
      throw new Error('Invalid slug should have failed');
    } catch (e) {
      if ((e as Error).message.includes('Validation error')) {
        console.log('   ✅ Invalid slug rejected correctly');
      } else {
        throw e;
      }
    }

    console.log('\n3. Testing UpdateUserProfileSchema');
    
    // Valid partial update
    try {
      const validData = { name: 'John Doe', alias: 'john_doe' };
      validateData(UpdateUserProfileSchema, validData);
      console.log('   ✅ Valid partial user data accepted');
    } catch (e) {
      throw new Error('Valid UpdateUserProfileSchema rejected: ' + (e as Error).message);
    }

    // Invalid alias
    try {
      validateData(UpdateUserProfileSchema, {
        alias: 'INVALID ALIAS' // uppercase and spaces not allowed
      });
      throw new Error('Invalid alias should have failed');
    } catch (e) {
      if ((e as Error).message.includes('Validation error')) {
        console.log('   ✅ Invalid alias rejected correctly');
      } else {
        throw e;
      }
    }

    console.log('\n4. Testing AnalyzeImageSchema');
    
    // Valid case
    try {
      const validData = {
        imageUrl: 'https://example.com/image.jpg',
        locale: 'es'
      };
      validateData(AnalyzeImageSchema, validData);
      console.log('   ✅ Valid image analysis request accepted');
    } catch (e) {
      throw new Error('Valid AnalyzeImageSchema rejected: ' + (e as Error).message);
    }

    // Invalid URL
    try {
      validateData(AnalyzeImageSchema, {
        imageUrl: 'not-a-url',
        locale: 'es'
      });
      throw new Error('Invalid URL should have failed');
    } catch (e) {
      if ((e as Error).message.includes('Validation error')) {
        console.log('   ✅ Invalid URL rejected correctly');
      } else {
        throw e;
      }
    }

    console.log('\n✅ All Zod validation tests PASSED!');

  } catch (error) {
    console.error('❌ Zod validation tests FAILED:', error);
    throw error;
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runZodValidationTests().then(() => process.exit(0)).catch(() => process.exit(1));
}
