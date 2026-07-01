const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync('password123', salt, 64).toString('hex');
console.log(`${salt}:${hash}`);
