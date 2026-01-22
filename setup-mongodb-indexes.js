/**
 * MongoDB Index Setup Script
 * Run this script to create optimal indexes for better performance
 * 
 * Usage:
 *   node setup-mongodb-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Helper function to create indexes safely
async function createIndexSafely(collection, indexSpec, options, description) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`  ✅ ${description}`);
    return true;
  } catch (error) {
    if (error.code === 11000) {
      console.log(`  ⚠️  ${description} - Skipped (duplicate data exists, manual cleanup needed)`);
    } else if (error.codeName === 'IndexOptionsConflict' || error.code === 85 || error.code === 86) {
      console.log(`  ℹ️  ${description} - Already exists (skipping)`);
      return true; // Already exists is OK
    } else {
      console.log(`  ❌ ${description} - Error: ${error.message}`);
    }
    return false;
  }
}

async function setupIndexes() {
  let successCount = 0;
  let totalCount = 0;
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    console.log('Creating indexes for optimal performance...\n');

    // Betting Collections - Most frequently queried
    console.log('📊 Betting Collections:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('bettings'),
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true },
      'betting: periodid + tab'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('bettings'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'betting: userid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminbettings'),
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true },
      'oneMinBetting: periodid + tab'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminbettings'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'oneMinBetting: userid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastgamebettings'),
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true },
      'fastGameBetting: periodid + tab'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastgamebettings'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'fastGameBetting: userid'
    ) ? 1 : 0;
    
    console.log('');

    // Wallet Collection - Frequently updated
    console.log('💰 Wallet Collection:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('wallets'),
      { userid: 1 },
      { name: 'idx_userid', unique: true, background: true },
      'wallet: userid (unique)'
    ) ? 1 : 0;
    
    console.log('');

    // User Collection
    console.log('👤 User Collection:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('users'),
      { mobile_number: 1 },
      { 
        name: 'idx_mobile', 
        unique: true, 
        sparse: true, 
        background: true,
        partialFilterExpression: { 
          mobile_number: { $exists: true, $ne: "", $type: "string" } 
        }
      },
      'users: mobile_number (unique, non-empty only)'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('users'),
      { email: 1 },
      { 
        name: 'idx_email', 
        unique: true, 
        sparse: true, 
        background: true,
        partialFilterExpression: { 
          email: { $exists: true, $ne: "", $type: "string" } 
        }
      },
      'users: email (unique, non-empty only)'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('users'),
      { owncode: 1 },
      { name: 'idx_owncode', background: true },
      'users: owncode'
    ) ? 1 : 0;
    
    console.log('');

    // Results Collections
    console.log('🎯 Results Collections:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('results'),
      { periodid: 1 },
      { name: 'idx_periodid', background: true },
      'results: periodid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminresults'),
      { periodid: 1 },
      { name: 'idx_periodid', background: true },
      'oneMinResult: periodid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastwinresults'),
      { periodid: 1 },
      { name: 'idx_periodid', background: true },
      'fastWinResult: periodid'
    ) ? 1 : 0;
    
    console.log('');

    // User Results Collections
    console.log('📈 User Results Collections:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('userresults'),
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true },
      'userresults: userid + periodid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminuserresults'),
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true },
      'oneMinUserResult: userid + periodid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastwinuserresults'),
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true },
      'fastWinUserResult: userid + periodid'
    ) ? 1 : 0;
    
    console.log('');

    // Order Collections
    console.log('📦 Order Collections:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('orders'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'orders: userid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminorders'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'oneMinOrder: userid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastwinorders'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'fastWinOrder: userid'
    ) ? 1 : 0;
    
    console.log('');

    // Wallet Summary - Frequently queried for history
    console.log('📜 Wallet Summary:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('walletsummeries'),
      { userid: 1, createdate: -1 },
      { name: 'idx_userid_createdate', background: true },
      'walletsummery: userid + createdate (desc)'
    ) ? 1 : 0;
    
    console.log('');

    // Bonus Summary
    console.log('🎁 Bonus Summary:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('bonussummeries'),
      { userid: 1 },
      { name: 'idx_userid', background: true },
      'bonussummery: userid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('bonussummeries'),
      { laveluser: 1 },
      { name: 'idx_laveluser', background: true },
      'bonussummery: laveluser'
    ) ? 1 : 0;
    
    console.log('');

    // Period ID Collections
    console.log('🔢 Period ID Collections:');
    
    totalCount++; successCount += await createIndexSafely(
      db.collection('gameids'),
      { gameid: 1 },
      { name: 'idx_gameid', background: true },
      'gameids: gameid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('oneminperiodids'),
      { gameid: 1 },
      { name: 'idx_gameid', background: true },
      'oneMinPeriodId: gameid'
    ) ? 1 : 0;

    totalCount++; successCount += await createIndexSafely(
      db.collection('fastwinperiodids'),
      { gameid: 1 },
      { name: 'idx_gameid', background: true },
      'fastWinPeriodId: gameid'
    ) ? 1 : 0;
    
    console.log('');

    console.log('====================================');
    console.log(`✅ Index setup completed!`);
    console.log(`   Success: ${successCount}/${totalCount} indexes`);
    if (successCount < totalCount) {
      console.log(`   ⚠️  ${totalCount - successCount} indexes skipped (see warnings above)`);
    }
    console.log('====================================');
    console.log('\n📊 Performance improvements:');
    console.log('  - Faster bet queries (periodid + tab)');
    console.log('  - Faster wallet updates (userid)');
    console.log('  - Faster user lookups (mobile, email)');
    console.log('  - Faster result processing');
    console.log('\n⚡ Expected query speedup: 10-100x for indexed fields');

  } catch (error) {
    console.error('\n❌ Fatal error during index setup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the setup
setupIndexes();
