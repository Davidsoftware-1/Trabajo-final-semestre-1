const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const admins = [
  {
    email: 'gonzalezbernalsteeven@gmail.com',
    password: '@barcelona@',
    name: 'Steeven Gonzalez Bernal'
  },
  {
    email: 'smarin_1171@unihumboldt.edu.co',
    password: '1094911727',
    name: 'Sebastian Marin'
  },
  {
    email: 'djlopez_1247@unihumboldt.edu.co',
    password: '@Dav1091@',
    name: 'David Lopez'
  }
];

async function createAdmins() {
  try {
    console.log('Creating administrators...');
    
    for (const admin of admins) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [admin.email.toLowerCase()]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`User ${admin.email} already exists, updating to admin...`);
        
        // Update existing user to admin
        await pool.query(
          'UPDATE users SET is_admin = true, is_verified = true WHERE email = $1',
          [admin.email.toLowerCase()]
        );
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        // Insert new admin user
        await pool.query(
          `INSERT INTO users (email, password, name, native_language, learning_language, language_level, is_admin, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [admin.email.toLowerCase(), hashedPassword, admin.name, 'Spanish', 'English', 'C2', true, true]
        );
        
        console.log(`Created admin: ${admin.email}`);
      }
    }
    
    console.log('Administrators created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating administrators:', error);
    process.exit(1);
  }
}

createAdmins();
