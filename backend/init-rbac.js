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

// Step 3: Create Default Super Admin user
const createDefaultSuperAdmin = () => {
  return new Promise((resolve) => {
    const INIT_SUPER_ADMIN = process.env.INIT_SUPER_ADMIN === 'true';
    
    if (!INIT_SUPER_ADMIN) {
      console.log('\n📝 To create a default Super Admin user, set environment variable:');
      console.log('   INIT_SUPER_ADMIN=true node init-rbac.js\n');
      resolve(false);
    } else {
      const superAdminEmail = 'superadmin@fleet.com';
      const superAdminPassword = 'SuperAdmin@123';
      
      console.log('\n📝 Creating default Super Admin user...');
      
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

        const saltRounds = 10;
        bcrypt.hash(superAdminPassword, saltRounds, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error('❌ Error hashing password:', hashErr.message);
            resolve(false);
            return;
          }

          db.query('SELECT id FROM roles WHERE name = ?', ['Super Admin'], (roleErr, roleRes) => {
            if (roleErr || !roleRes.length) {
              console.error('❌ Error finding Super Admin role');
              resolve(false);
              return;
            }

            const superAdminRoleId = roleRes[0].id;

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
                resolve(true);
              }
            });
          });
        });
      });
    }
  });
};

// Step 4: Optionally create test users for each role
const createTestUsers = () => {
  return new Promise((resolve) => {
    const INIT_TEST_USERS = process.env.INIT_TEST_USERS === 'true';
    
    if (!INIT_TEST_USERS) {
      console.log('\n📝 To create test users for each role, set environment variable:');
      console.log('   INIT_TEST_USERS=true node init-rbac.js\n');
      resolve(false);
    } else {
      createTestUsersSequence(resolve);
    }
  });
};

// Create test users one by one
const createTestUsersSequence = (resolve) => {
  console.log('\n📝 Creating test users for each role...');

  const testUsers = [
    {
      full_name: 'Fleet Manager User',
      email: 'manager@fleet.com',
      password: 'Manager@123',
      role_name: 'Fleet Manager'
    },
    {
      full_name: 'Dispatcher User',
      email: 'dispatcher@fleet.com',
      password: 'Dispatcher@123',
      role_name: 'Dispatcher'
    },
    {
      full_name: 'Safety Officer User',
      email: 'safety@fleet.com',
      password: 'Safety@123',
      role_name: 'Safety Officer'
    },
    {
      full_name: 'Financial Analyst User',
      email: 'analyst@fleet.com',
      password: 'Analyst@123',
      role_name: 'Financial Analyst'
    }
  ];

  let createdCount = 0;

  testUsers.forEach(testUser => {
    // Get role ID
    db.query('SELECT id FROM roles WHERE name = ?', [testUser.role_name], (roleErr, roleRes) => {
      if (roleErr || !roleRes.length) {
        console.log(`❌ Role not found: ${testUser.role_name}`);
        return;
      }

      const roleId = roleRes[0].id;

      // Check if user already exists
      db.query('SELECT id FROM users WHERE email = ?', [testUser.email], (checkErr, checkRes) => {
        if (checkErr) {
          console.log(`❌ Error checking user ${testUser.email}`);
          return;
        }

        if (checkRes.length > 0) {
          console.log(`ℹ️  User already exists: ${testUser.email} (${testUser.role_name})`);
          createdCount++;
          if (createdCount === testUsers.length) {
            resolve(true);
          }
          return;
        }

        // Hash password
        const saltRounds = 10;
        bcrypt.hash(testUser.password, saltRounds, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.log(`❌ Error hashing password for ${testUser.email}`);
            return;
          }

          // Create user
          const newUser = {
            role_id: roleId,
            full_name: testUser.full_name,
            email: testUser.email,
            password_hash: hashedPassword,
            is_active: true
          };

          db.query('INSERT INTO users SET ?', newUser, (insertErr) => {
            if (insertErr) {
              console.log(`❌ Error creating user ${testUser.email}`);
            } else {
              console.log(`✅ Created: ${testUser.email} (${testUser.role_name})`);
              console.log(`   Password: ${testUser.password}`);
            }
            createdCount++;
            if (createdCount === testUsers.length) {
              resolve(true);
            }
          });
        });
      });
    });
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

    // Step 3: Create default Super Admin user
    await createDefaultSuperAdmin();

    // Step 4: Create test users for each role
    await createTestUsers();

    // Summary
    console.log('\n✅ RBAC Initialization Complete!\n');
    console.log('Test Users Created:');
    console.log('─'.repeat(60));
    console.log('Email                    | Password         | Role');
    console.log('─'.repeat(60));
    console.log('superadmin@fleet.com     | SuperAdmin@123   | Super Admin');
    console.log('manager@fleet.com        | Manager@123      | Fleet Manager');
    console.log('dispatcher@fleet.com     | Dispatcher@123   | Dispatcher');
    console.log('safety@fleet.com         | Safety@123       | Safety Officer');
    console.log('analyst@fleet.com        | Analyst@123      | Financial Analyst');
    console.log('─'.repeat(60));
    console.log('\nNext Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Login with any test user above');
    console.log('3. Check RBAC_SETUP.md for detailed documentation\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
};

main();
