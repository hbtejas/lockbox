const bcrypt = require('bcryptjs');
const UserModel = require('./src/models/User');
const { query } = require('./src/config/db');

async function createDefaultUser() {
  try {
    const passwordHash = await bcrypt.hash('password123', 12);
    const existing = await UserModel.findByEmail('admin@lockbox.com');
    if (!existing) {
      await UserModel.createUser({
        name: 'Lockbox Admin',
        email: 'admin@lockbox.com',
        passwordHash,
      });
      console.log('User created successfully.');
    } else {
      console.log('User already exists.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

createDefaultUser();
