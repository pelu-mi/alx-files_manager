const { createHash } = require('crypto');

export const hashPassword = (password) => createHash('sha1').update(password).digest('hex');

export const sampleExport = 0;
