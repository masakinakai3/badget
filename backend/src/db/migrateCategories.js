const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Starting migration...');

db.serialize(() => {
    db.run('PRAGMA foreign_keys=OFF');

    db.run('DROP TABLE IF EXISTS cat_mapping');
    db.run('DROP TABLE IF EXISTS categories_new');

    db.run('CREATE TABLE cat_mapping (old_id INTEGER, new_id INTEGER)');
    db.run('CREATE TABLE categories_new (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)');

    db.all('SELECT * FROM categories', (err, rows) => {
        if (err) {
            console.error('Error reading categories', err);
            return;
        }

        db.serialize(() => {
            let insertStmt = db.prepare('INSERT OR IGNORE INTO categories_new (name) VALUES (?)');
            rows.forEach(r => insertStmt.run(r.name));
            insertStmt.finalize();

            db.all('SELECT * FROM categories_new', (err, newCats) => {
                if (err) return console.error(err);

                db.serialize(() => {
                    let mapStmt = db.prepare('INSERT INTO cat_mapping (old_id, new_id) VALUES (?, ?)');
                    rows.forEach(oldCat => {
                        const newCat = newCats.find(c => c.name === oldCat.name);
                        if (newCat) mapStmt.run(oldCat.id, newCat.id);
                    });
                    mapStmt.finalize();

                    // Update budget_plans
                    db.run('UPDATE budget_plans SET category_id = (SELECT new_id FROM cat_mapping WHERE old_id = budget_plans.category_id)');

                    // Update expenses
                    db.run('UPDATE expenses SET category_id = (SELECT new_id FROM cat_mapping WHERE old_id = expenses.category_id)');

                    // Drop old tables
                    db.run('DROP TABLE categories');
                    db.run('ALTER TABLE categories_new RENAME TO categories');
                    db.run('DROP TABLE cat_mapping');

                    db.run('PRAGMA foreign_keys=ON', () => {
                        console.log("Migration complete!");
                    });
                });
            });
        });
    });
});
