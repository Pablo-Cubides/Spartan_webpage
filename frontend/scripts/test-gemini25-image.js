
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyBed4P0a-FdW2TOHkG80AgXjr2BiQmzrHI';
const MODEL = 'gemini-2.5-flash-image';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testImageGen() {
    console.log('Testing Gemini 2.5 Flash Image Generation...');
    console.log('Model:', MODEL);

    const payload = {
        contents: [{
            parts: [
                { text: "Generate a professional portrait photo of a man with short hair and a beard. Photorealistic, high quality, studio lighting." }
            ]
        }],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
        }
    };

    try {
        const resp = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Status:', resp.status);

        if (!resp.ok) {
            const txt = await resp.text();
            console.error('Error Body:', txt.substring(0, 500));
            return;
        }

        const data = await resp.json();

        // Check for candidates
        if (data.candidates && data.candidates.length > 0) {
            const parts = data.candidates[0].content?.parts || [];
            console.log('Parts count:', parts.length);

            for (const part of parts) {
                if (part.text) {
                    console.log('Text response:', part.text.substring(0, 100));
                }
                if (part.inlineData) {
                    console.log('✅ IMAGE GENERATED!');
                    console.log('Image MIME:', part.inlineData.mimeType);
                    console.log('Image data length:', part.inlineData.data?.length || 0, 'chars');
                    return;
                }
            }
            console.log('No image in response parts');
        } else {
            console.log('No candidates in response');
            console.log('Response:', JSON.stringify(data).substring(0, 500));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testImageGen();
