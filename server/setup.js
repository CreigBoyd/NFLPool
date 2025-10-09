#!/usr/bin/env node

/**
 * Standalone setup script for NFL Pool application
 * Run with: node setup.js
 */

import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './database.js';

dotenv.config();

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   NFL POOL - DATABASE SETUP SCRIPT        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Initialize database and setup admin
    await initializeDatabase();

    console.log('\n✅ Setup completed successfully!\n');
    console.log('You can now start the server with: npm start\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease fix the error and run setup again.\n');
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run the setup
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});