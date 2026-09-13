const path = require('path');

const DATABASE_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../shopping.db');

module.exports = { DATABASE_PATH };
