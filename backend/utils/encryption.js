const crypto = require('crypto');

// Use a 32-character key for AES-256-CBC
const ENCRYPTION_KEY = process.env.MSG_ENCRYPTION_KEY || 'a_very_secure_32_char_long_key_!'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16 bytes

function encrypt(text) {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Format: iv_hex:encrypted_hex
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return '';
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) {
            // Return text directly if it is not in iv:encrypted format (e.g. legacy message)
            return text;
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        // Fallback to plain text on error (e.g., if message was not encrypted)
        return text;
    }
}

module.exports = {
    encrypt,
    decrypt
};
