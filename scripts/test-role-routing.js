/**
 * Role-Based Routing Test Script
 * 
 * This script helps verify that users in Firestore have the correct role field set.
 * Run this to check if your user documents are properly configured.
 * 
 * Usage:
 * node scripts/test-role-routing.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUserRoles() {
  console.log('\n🔍 Checking User Roles in Firestore...\n');
  console.log('='.repeat(80));
  
  try {
    // Check users collection
    console.log('\n📁 Users Collection:');
    console.log('-'.repeat(80));
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️  No users found in users collection');
    } else {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const role = data.role || '❌ NO ROLE SET';
        const roleEmoji = {
          'admin': '👑',
          'mentor': '👨‍🏫',
          'student': '👨‍🎓',
          'data_analyst': '📊'
        }[data.role] || '❓';
        
        console.log(`${roleEmoji} ${data.email || 'No email'}`);
        console.log(`   UID: ${doc.id}`);
        console.log(`   Role: ${role}`);
        console.log(`   Name: ${data.name || 'No name'}`);
        console.log();
      });
      console.log(`Total users: ${usersSnapshot.size}`);
    }
    
    // Check creators collection
    console.log('\n📁 Creators Collection:');
    console.log('-'.repeat(80));
    const creatorsSnapshot = await db.collection('creators').get();
    
    if (creatorsSnapshot.empty) {
      console.log('⚠️  No creators found in creators collection');
    } else {
      creatorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`🎨 ${data.email || 'No email'}`);
        console.log(`   UID: ${doc.id}`);
        console.log(`   Role: creator (implicit)`);
        console.log(`   Name: ${data.name || 'No name'}`);
        console.log();
      });
      console.log(`Total creators: ${creatorsSnapshot.size}`);
    }
    
    // Check for users without roles
    console.log('\n⚠️  Users Without Roles:');
    console.log('-'.repeat(80));
    const usersWithoutRoles = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.role) {
        usersWithoutRoles.push({ id: doc.id, email: data.email, name: data.name });
      }
    });
    
    if (usersWithoutRoles.length === 0) {
      console.log('✅ All users have roles assigned!');
    } else {
      console.log(`❌ Found ${usersWithoutRoles.length} users without roles:`);
      usersWithoutRoles.forEach(user => {
        console.log(`   - ${user.email || user.id} (${user.name || 'No name'})`);
      });
      console.log('\n💡 Tip: Add a "role" field to these users in Firestore');
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Summary:');
    console.log(`   Total users in "users" collection: ${usersSnapshot.size}`);
    console.log(`   Total users in "creators" collection: ${creatorsSnapshot.size}`);
    console.log(`   Users without roles: ${usersWithoutRoles.length}`);
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  }
  
  process.exit(0);
}

// Run the check
checkUserRoles();
