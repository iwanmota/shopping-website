const fs = require('fs');
const { DATABASE_PATH } = require('./config/database');

if (fs.existsSync(DATABASE_PATH)) fs.unlinkSync(DATABASE_PATH);
require('./initDb');