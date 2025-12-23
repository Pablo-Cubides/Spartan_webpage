
import fetch from 'node-fetch';

const BASE_URL = 'https://webpage-xi-seven-three.vercel.app';

// Test a sample image URL (public image for testing)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';

async function testAnalyze() {
    console.log('Testing /api/asesor-estilo/analyze in production...');
    console.log('Image URL:', TEST_IMAGE_URL);

    try {
        const resp = await fetch(`${BASE_URL}/api/asesor-estilo/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: TEST_IMAGE_URL, locale: 'es' })
        });

        console.log('Status:', resp.status);

        if (!resp.ok) {
            const txt = await resp.text();
            console.error('Error:', txt.substring(0, 500));
            return;
        }

        const data = await resp.json();
        console.log('\n✅ Analysis successful!');
        console.log('Face OK:', data.analysis?.faceOk);
        console.log('Suggested Text:', data.analysis?.suggestedText?.substring(0, 100) + '...');
        console.log('Recommended Changes:', JSON.stringify(data.analysis?.recommendedChanges, null, 2));

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testAnalyze();
