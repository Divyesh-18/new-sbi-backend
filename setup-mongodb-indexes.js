/**
 * MongoDB Index Setup Script
 * Run this script to create optimal indexes for better performance
 * 
 * Usage:
 *   node setup-mongodb-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models to ensure they're registered
require('./models/betting');
require('./models/oneMinBetting.model');
require('./models/fastGameBetting');
require('./models/wallet');
require('./models/user');
require('./models/result');
require('./models/oneMinResult.model');
require('./models/fastWinResult');
require('./models/userresult');
require('./models/oneMinUserResult.model');
require('./models/fastWinUserResult');
require('./models/order');
require('./models/oneMinOrder.model');
require('./models/fastWinOrder');

async function setupIndexes() {
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
    
    await db.collection('bettings').createIndex(
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true }
    );
    console.log('  ✅ betting: periodid + tab');

    await db.collection('bettings').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ betting: userid');

    await db.collection('oneminbettings').createIndex(
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true }
    );
    console.log('  ✅ oneMinBetting: periodid + tab');

    await db.collection('oneminbettings').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ oneMinBetting: userid');

    await db.collection('fastgamebettings').createIndex(
      { periodid: 1, tab: 1 },
      { name: 'idx_periodid_tab', background: true }
    );
    console.log('  ✅ fastGameBetting: periodid + tab');

    await db.collection('fastgamebettings').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ fastGameBetting: userid\n');

    // Wallet Collection - Frequently updated
    console.log('💰 Wallet Collection:');
    
    await db.collection('wallets').createIndex(
      { userid: 1 },
      { name: 'idx_userid', unique: true, background: true }
    );
    console.log('  ✅ wallet: userid (unique)\n');

    // User Collection
    console.log('👤 User Collection:');
    
    await db.collection('users').createIndex(
      { mobile_number: 1 },
      { name: 'idx_mobile', unique: true, sparse: true, background: true }
    );
    console.log('  ✅ users: mobile_number (unique)');

    await db.collection('users').createIndex(
      { email: 1 },
      { name: 'idx_email', unique: true, sparse: true, background: true }
    );
    console.log('  ✅ users: email (unique)');

    await db.collection('users').createIndex(
      { owncode: 1 },
      { name: 'idx_owncode', background: true }
    );
    console.log('  ✅ users: owncode\n');

    // Results Collections
    console.log('🎯 Results Collections:');
    
    await db.collection('results').createIndex(
      { periodid: 1 },
      { name: 'idx_periodid', unique: true, background: true }
    );
    console.log('  ✅ results: periodid (unique)');

    await db.collection('oneminresults').createIndex(
      { periodid: 1 },
      { name: 'idx_periodid', unique: true, background: true }
    );
    console.log('  ✅ oneMinResult: periodid (unique)');

    await db.collection('fastwinresults').createIndex(
      { periodid: 1 },
      { name: 'idx_periodid', unique: true, background: true }
    );
    console.log('  ✅ fastWinResult: periodid (unique)\n');

    // User Results Collections
    console.log('📈 User Results Collections:');
    
    await db.collection('userresults').createIndex(
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true }
    );
    console.log('  ✅ userresults: userid + periodid');

    await db.collection('oneminuserresults').createIndex(
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true }
    );
    console.log('  ✅ oneMinUserResult: userid + periodid');

    await db.collection('fastwinuserresults').createIndex(
      { userid: 1, periodid: 1 },
      { name: 'idx_userid_periodid', background: true }
    );
    console.log('  ✅ fastWinUserResult: userid + periodid\n');

    // Order Collections
    console.log('📦 Order Collections:');
    
    await db.collection('orders').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ orders: userid');

    await db.collection('oneminorders').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ oneMinOrder: userid');

    await db.collection('fastwinorders').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ fastWinOrder: userid\n');

    // Wallet Summary - Frequently queried for history
    console.log('📜 Wallet Summary:');
    
    await db.collection('walletsummeries').createIndex(
      { userid: 1, createdate: -1 },
      { name: 'idx_userid_createdate', background: true }
    );
    console.log('  ✅ walletsummery: userid + createdate (desc)\n');

    // Bonus Summary
    console.log('🎁 Bonus Summary:');
    
    await db.collection('bonussummeries').createIndex(
      { userid: 1 },
      { name: 'idx_userid', background: true }
    );
    console.log('  ✅ bonussummery: userid');

    await db.collection('bonussummeries').createIndex(
      { laveluser: 1 },
      { name: 'idx_laveluser', background: true }
    );
    console.log('  ✅ bonussummery: laveluser\n');

    // Period ID Collections
    console.log('🔢 Period ID Collections:');
    
    await db.collection('gameids').createIndex(
      { gameid: 1 },
      { name: 'idx_gameid', background: true }
    );
    console.log('  ✅ gameids: gameid');

    await db.collection('oneminperiodids').createIndex(
      { gameid: 1 },
      { name: 'idx_gameid', background: true }
    );
    console.log('  ✅ oneMinPeriodId: gameid');

    await db.collection('fastwinperiodids').createIndex(
      { gameid: 1 },
      { name: 'idx_gameid', background: true }
    );
    console.log('  ✅ fastWinPeriodId: gameid\n');

    console.log('✅ All indexes created successfully!');
    console.log('\nPerformance improvements:');
    console.log('  - Faster bet queries (periodid + tab)');
    console.log('  - Faster wallet updates (userid)');
    console.log('  - Faster user lookups (mobile, email)');
    console.log('  - Faster result processing');
    console.log('\nExpected query speedup: 10-100x for indexed fields');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

// Run the setup
setupIndexes();
