import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

async function testDns() {
  try {
    console.log('Testing DNS resolution for api.cloudinary.com...');
    const result = await lookup('api.cloudinary.com');
    console.log('Success:', result);
  } catch (err) {
    console.error('DNS Lookup failed:', err);
  }
}

testDns();
