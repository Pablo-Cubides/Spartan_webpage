
console.log('Step 1: Start');
import path from 'path';
console.log('Step 2: Path imported');

async function run() {
    console.log('Step 3: Async start');
    try {
        console.log('Step 4: Importing config...');
        const configModule = await import('../../src/lib/asesor-estilo/config/app.config');
        console.log('Step 5: Config imported');
        console.log('Config keys:', Object.keys(configModule));
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
