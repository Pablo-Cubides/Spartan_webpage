
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyBed4P0a-FdW2TOHkG80AgXjr2BiQmzrHI';
const MODEL = 'imagen-3.0-generate-001';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;

async function testGen() {
    console.log('Testing API Key with Imagen 3...');

    const payload = {
        instances: [
            { prompt: "A futuristic city with flying cars, photorealistic, 8k" }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    try {
        const resp = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Status:', resp.status);
        const txt = await resp.text();

        if (!resp.ok) {
            console.error('Error Body:', txt);
        } else {
            console.log('Success! Response length:', txt.length);
            console.log('Use this key in Vercel environment variables.');
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testGen();
