const fs = require('fs');
const path = require('path');
const db = require('../database/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    console.log('Running schema...');
    await db.query(sql);
    console.log('Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Schema apply error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
