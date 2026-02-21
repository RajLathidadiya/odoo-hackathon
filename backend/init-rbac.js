#!/usr/bin/env node

/**
 * Fleet Management System - RBAC Initialization Script
 * 
 * This script initializes the RBAC system by:
 * 1. Adding Super Admin role if it doesn't exist
 * 2. Optionally creates a default Super Admin user
 * 
 * Usage:
 * node init-rbac.js
 */

const db = require('./config/database');
const bcrypt = require('bcryptjs');

console.log('🔐 Fleet Management System - RBAC Initialization\n');

// Step 1: Add Super Admin role
console.log('Step 1: Checking Super Admin role...');

const addSuperAdminRole = () => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO roles (name, description) 
      SELECT 'Super Admin', 'Full system access with administrative privileges'
      WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Super Admin')
    `;

    db.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.affectedRows > 0) {
          console.log('✅ Super Admin role added successfully');
          resolve();
        } else {
          console.log('ℹ️  Super Admin role already exists');
          resolve();
        }
      }
    });
  });
};

// Step 2: Get all roles
const getAllRoles = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM roles ORDER BY id', (err, roles) => {
      if (err) {
        reject(err);
      } else {
        resolve(roles);
      }
    });
  });
};

// Step 3: Display roles
const displayRoles = (roles) => {
  console.log('\nCurrent Roles in Database:');
  console.log('─'.repeat(60));
  console.log('ID | Role Name            | Description');
  console.log('─'.repeat(60));
  roles.forEach(role => {
    const id = role.id.toString().padEnd(2);
    const name = role.name.padEnd(20);
    const desc = role.description || 'No description';
    console.log(`${id} | ${name} | ${desc}`);
  });
  console.log('─'.repeat(60));
};

// Step 4: Prompt to create Super Admin user
const createDefaultSuperAdmin = () => {
  return new Promise((resolve) => {
    // For automated setup without user interaction, we'll use environment variable
    const INIT_SUPER_ADMIN = process.env.INIT_SUPER_ADMIN === 'true';
    
    if (!INIT_SUPER_ADMIN) {
      console.log('\n📝 To create a default Super Admin user, set environment variable:');
      console.log('   INIT_SUPER_ADMIN=true node init-rbac.js\n');
      resolve(false);
    } else {
      // Create default super admin
      const superAdminEmail = 'superadmin@fleet.com';
      const superAdminPassword = 'SuperAdmin@123';
      
      console.log('\n📝 Creating default Super Admin user...');
      
      // Check if user already exists
      db.query('SELECT id FROM users WHERE email = ?', [superAdminEmail], (err, res) => {
        if (err) {
          console.error('❌ Database error:', err.message);
          resolve(false);
          return;
        }

        if (res.length > 0) {
          console.log('ℹ️  Super Admin user already exists (superadmin@fleet.com)');
          resolve(false);
          return;
        }

        // Hash password
        const saltRounds = 10;
        bcrypt.hash(superAdminPassword, saltRounds, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error('❌ Error hashing password:', hashErr.message);
            resolve(false);
            return;
          }

          // Get Super Admin role ID
          db.query('SELECT id FROM roles WHERE name = ?', ['Super Admin'], (roleErr, roleRes) => {
            if (roleErr || !roleRes.length) {
              console.error('❌ Error finding Super Admin role');
              resolve(false);
              return;
            }

            const superAdminRoleId = roleRes[0].id;

            // Create user
            const newUser = {
              role_id: superAdminRoleId,
              full_name: 'System Administrator',
              email: superAdminEmail,
              password_hash: hashedPassword,
              is_active: true
            };

            db.query('INSERT INTO users SET ?', newUser, (insertErr) => {
              if (insertErr) {
                console.error('❌ Error creating Super Admin user:', insertErr.message);
                resolve(false);
              } else {
                console.log('✅ Default Super Admin user created:');
                console.log(`   Email: ${superAdminEmail}`);
                console.log(`   Password: ${superAdminPassword}`);
                console.log('   ⚠️  Change this password immediately in production!\n');
                resolve(true);
              }
            });
          });
        });
      });
    }
  });
};

// Main execution
const main = async () => {
  try {
    // Step 1: Add Super Admin role
    await addSuperAdminRole();

    // Step 2: Display all roles
    const roles = await getAllRoles();
    displayRoles(roles);

    // Step 3: Optional - Create default Super Admin user
    const userCreated = await createDefaultSuperAdmin();

    // Summary
    console.log('\n✅ RBAC Initialization Complete!\n');
    console.log('Next Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Login with a test user to verify RBAC is working');
    console.log('3. Check RBAC_SETUP.md for detailed documentation\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
};

main();
