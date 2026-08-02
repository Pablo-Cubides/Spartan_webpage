// Coach Triarvon - Message Encryption
// AES-256-GCM encryption for message storage

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;


function getEncryptionKey(): Buffer {
    const key = process.env.COACH_ENCRYPTION_KEY;

    if (!key) {
        // In development, use a default key (NOT for production)
        if (process.env.NODE_ENV === 'development') {
            console.warn('[Coach Triarvon] Using default encryption key - NOT SAFE FOR PRODUCTION');
            return crypto.scryptSync('dev-key-triarvon-coach', 'salt', 32);
        }
        throw new Error('COACH_ENCRYPTION_KEY environment variable is required');
    }

    // Derive a 32-byte key from the provided key
    return crypto.scryptSync(key, 'triarvon-salt', 32);
}

export function encryptMessage(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptMessage(encryptedData: string): string {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

// For displaying in conversation (decrypts array of messages)
export function decryptMessages(messages: { role: string; content: string; created_at: Date }[]): { role: string; content: string; created_at: Date }[] {
    return messages.map(msg => ({
        ...msg,
        content: decryptMessage(msg.content)
    }));
}
