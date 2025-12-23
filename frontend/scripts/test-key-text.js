
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyBed4P0a-FdW2TOHkG80AgXjr2BiQmzrHI';
const MODEL = 'gemini-2.0-flash-exp';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testText() {
    console.log('Testing API Key with Gemini Text...');

    const payload = {
        contents: [{
            parts: [{ text: "Hello, are you working?" }]
        }]
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
            console.log('Success!', txt.substring(0, 100));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testText();
