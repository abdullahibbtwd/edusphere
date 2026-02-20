import crypto from 'crypto';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32bytes!!';

// Ensure key is 32 bytes for AES-256
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 * @param text Text to encrypt
 * @returns Encrypted text in format: iv:encryptedData:authTag
 */
export function encrypt(text: string): string {
    if (!text || text.trim() === '') {
        return '';
    }

    try {
        // Generate random initialization vector
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        // Return iv:encrypted:authTag (all in hex)
        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt encrypted data
 * @param encryptedText Encrypted text in format: iv:encryptedData:authTag
 * @returns Decrypted text
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText || encryptedText.trim() === '') {
        return '';
    }

    try {
        // Split the encrypted text into parts
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const [ivHex, encrypted, authTagHex] = parts;

        // Convert from hex
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);

        // Decrypt the text
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Encrypt school identification numbers
 */
export function encryptSchoolIdentifiers(data: {
    rcNumber?: string;
    nemisId?: string;
    stateApprovalNumber?: string;
    waecNecoNumber?: string;
}) {
    return {
        rcNumber: data.rcNumber ? encrypt(data.rcNumber) : null,
        nemisId: data.nemisId ? encrypt(data.nemisId) : null,
        stateApprovalNumber: data.stateApprovalNumber ? encrypt(data.stateApprovalNumber) : null,
        waecNecoNumber: data.waecNecoNumber ? encrypt(data.waecNecoNumber) : null,
    };
}

/**
 * Decrypt school identification numbers
 */
export function decryptSchoolIdentifiers(data: {
    rcNumber?: string | null;
    nemisId?: string | null;
    stateApprovalNumber?: string | null;
    waecNecoNumber?: string | null;
}) {
    return {
        rcNumber: data.rcNumber ? decrypt(data.rcNumber) : null,
        nemisId: data.nemisId ? decrypt(data.nemisId) : null,
        stateApprovalNumber: data.stateApprovalNumber ? decrypt(data.stateApprovalNumber) : null,
        waecNecoNumber: data.waecNecoNumber ? decrypt(data.waecNecoNumber) : null,
    };
}
