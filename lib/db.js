import path from 'path';
import Database from 'better-sqlite3';

let db;
let cleanupTimer;

// Orders from any day before today serve no purpose once that day is over —
// delete them outright rather than just hiding them, so the database never
// silently accumulates every order the class has ever placed.
function deleteOldOrders(database) {
  database.prepare('DELETE FROM orders WHERE day < ?').run(todayBerlin());
}

export function getDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data.db'));
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        order_text TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_orders_day ON orders(day);');

    const columns = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name);
    if (!columns.includes('restaurant')) {
      db.exec("ALTER TABLE orders ADD COLUMN restaurant TEXT NOT NULL DEFAULT ''");
    }

    deleteOldOrders(db);
    if (!cleanupTimer) {
      // Also sweep periodically so stale entries disappear shortly after
      // midnight even if nobody happens to hit the API right at 0:00.
      cleanupTimer = setInterval(() => deleteOldOrders(db), 60 * 1000);
    }
  }
  return db;
}

// Everyone should see the same "today", regardless of each visitor's own
// device timezone, so the list resets at midnight in one fixed timezone.
export function todayBerlin() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
}
