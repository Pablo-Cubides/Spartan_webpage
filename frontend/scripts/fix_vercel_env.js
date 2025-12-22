const { spawn } = require('child_process');

const envs = {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDHufKWVTLLNjUV59sewODi9pidvoVvKfc',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'spartan-abf01.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'spartan-abf01',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'spartan-abf01.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '74284949094',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:74284949094:web:372c36bedacda59507d7a7'
};

async function runCommand(command, args, stdinInput = null) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);
        const proc = spawn(command, args, { stdio: ['pipe', 'inherit', 'inherit'], shell: true });

        if (stdinInput) {
            // Write EXACTLY the input without extra newlines
            proc.stdin.write(stdinInput);
            proc.stdin.end();
        }

        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });

        proc.on('error', (err) => reject(err));
    });
}

async function main() {
    for (const [key, value] of Object.entries(envs)) {
        console.log(`\nProcessing ${key}...`);

        // 1. Remove existing
        try {
            console.log(`Removing ${key}...`);
            await runCommand('vercel', ['env', 'rm', key, 'production', '--yes']);
        } catch (e) {
            console.log(`Iterando... (puede que no existiera)`);
        }

        // 2. Add fresh with exact value
        console.log(`Adding ${key}...`);
        // 'vercel env add <name> <environment>' reads value from stdin
        await runCommand('vercel', ['env', 'add', key, 'production'], value);
    }
}

main().catch(console.error);
