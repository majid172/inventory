const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function seedPharmacyDatabase() {
  console.log(' Initializing Pharmacy Database & Categories Table...');

  try {
    const sqlPath = path.join(__dirname, 'pharmacy_schema.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL statements by semicolon
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

    for (const stmt of statements) {
      if (stmt) {
        await db.query(stmt);
      }
    }

    console.log('Pharmacy Database Tables & Categories successfully seeded!');
  } catch (error) {
    console.error(' Failed to initialize Pharmacy database:', error.message);
  }
}

if (require.main === module) {
  seedPharmacyDatabase().then(() => process.exit(0));
}

module.exports = seedPharmacyDatabase;
