const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Starting project_categories migration...');

db.serialize(() => {
    db.run('PRAGMA foreign_keys=OFF');

    // Create project_categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS project_categories (
        project_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, category_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // We need to link existing categories to projects.
    // By default, since categories used to be tied to projects until our previous migration 
    // where they became global, we want to essentially link EVERY global category to EVERY existing project
    // to preserve functionality (as if the user had selected all of them).
    // Or we could infer which project uses which category based on budget_plans & expenses.
    // Doing the "link every category to every project" is simplest and safest for a transition from global.
    db.all('SELECT id FROM projects', (err, projects) => {
        if (err) return console.error(err);

        db.all('SELECT id FROM categories', (err, categories) => {
            if (err) return console.error(err);

            db.serialize(() => {
                const stmt = db.prepare('INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (?, ?)');
                projects.forEach(p => {
                    categories.forEach(c => {
                        stmt.run(p.id, c.id);
                    });
                });
                stmt.finalize();

                db.run('PRAGMA foreign_keys=ON', () => {
                    console.log("Migration complete!");
                });
            });
        });
    });
});
