const pool = require('./config/database');

async function updateSchema() {
  try {
    console.log('Updating database schema...');
    
    // Check if is_admin column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('Adding is_admin column to users table...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
      `);
      console.log('is_admin column added successfully!');
    } else {
      console.log('is_admin column already exists');
    }
    
    console.log('Schema update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
