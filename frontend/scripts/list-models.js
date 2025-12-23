
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyBed4P0a-FdW2TOHkG80AgXjr2BiQmzrHI';

async function listModels() {
    console.log('Listing available models...');

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

    if (!resp.ok) {
        console.error('Error:', resp.status);
        return;
    }

    const data = await resp.json();

    console.log('Available models:');
    for (const model of data.models || []) {
        // Filter for image-related or flash models
        if (model.name.includes('image') || model.name.includes('flash') || model.name.includes('2.5') || model.name.includes('2.0')) {
            console.log('-', model.name, '|', model.supportedGenerationMethods?.join(', ') || 'N/A');
        }
    }
}

listModels();
