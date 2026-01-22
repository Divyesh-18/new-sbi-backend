/**
 * Cleanup Script for Empty Email/Mobile Fields
 * This script converts empty strings to null for better indexing
 * 
 * Usage:
 *   node cleanup-empty-emails.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🔍 Checking for empty email fields...');
    const emptyEmailCount = await usersCollection.countDocuments({ email: "" });
    console.log(`   Found ${emptyEmailCount} users with empty email\n`);

    if (emptyEmailCount > 0) {
      console.log('🔧 Converting empty emails to null...');
      const emailResult = await usersCollection.updateMany(
        { email: "" },
        { $set: { email: null } }
      );
      console.log(`   ✅ Updated ${emailResult.modifiedCount} documents\n`);
    }

    console.log('🔍 Checking for empty mobile_number fields...');
    const emptyMobileCount = await usersCollection.countDocuments({ mobile_number: "" });
    console.log(`   Found ${emptyMobileCount} users with empty mobile_number\n`);

    if (emptyMobileCount > 0) {
      console.log('🔧 Converting empty mobile numbers to null...');
      const mobileResult = await usersCollection.updateMany(
        { mobile_number: "" },
        { $set: { mobile_number: null } }
      );
      console.log(`   ✅ Updated ${mobileResult.modifiedCount} documents\n`);
    }

    console.log('====================================');
    console.log('✅ Cleanup completed successfully!');
    console.log('====================================');
    console.log('\n💡 Next steps:');
    console.log('   1. Run: node setup-mongodb-indexes.js');
    console.log('   2. This will create unique indexes properly');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the cleanup
cleanup();
