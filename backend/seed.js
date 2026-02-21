const db = require('./config/database');

const roles = [
    { id: 1, name: 'Admin', description: 'Full access to all features' },
    { id: 2, name: 'Manager', description: 'Can manage drivers, vehicles, and trips' },
    { id: 3, name: 'Driver', description: 'Can view and update assigned trips' },
];

console.log('Seeding roles...');

let completed = 0;

roles.forEach((role) => {
    db.query(
        'INSERT IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)',
        [role.id, role.name, role.description],
        (err, res) => {
            if (err) {
                console.error(`Error inserting role "${role.name}":`, err.message);
            } else {
                console.log(`✅ Role "${role.name}" seeded (affected rows: ${res.affectedRows})`);
            }
            completed++;
            if (completed === roles.length) {
                console.log('Seeding complete. Closing connection...');
                db.end();
                process.exit(0);
            }
        }
    );
});
