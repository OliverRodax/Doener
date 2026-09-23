import { NextResponse } from 'next/server';
import { getDb, todayBerlin } from '../../../lib/db';
import { RESTAURANT_NAMES } from '../../../lib/restaurants';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || todayBerlin();

  const db = getDb();
  const rows = db
    .prepare('SELECT id, name, order_text, restaurant, created_at FROM orders WHERE day = ? ORDER BY created_at ASC')
    .all(day);

  const orders = rows.map((r) => ({
    id: r.id,
    name: r.name,
    order: r.order_text,
    restaurant: r.restaurant,
    created_at: r.created_at,
  }));

  return NextResponse.json({ day, orders });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const name = String(body.name || '').trim().slice(0, 60);
  const order = String(body.order || '').trim().slice(0, 200);
  const restaurant = String(body.restaurant || '').trim();

  if (!name || !order) {
    return NextResponse.json({ error: 'Name und Bestellung sind erforderlich.' }, { status: 400 });
  }
  if (!RESTAURANT_NAMES.includes(restaurant)) {
    return NextResponse.json({ error: 'Bitte ein gültiges Lokal auswählen.' }, { status: 400 });
  }

  const day = todayBerlin();
  const createdAt = new Date().toISOString();

  const db = getDb();
  // token stays for schema compatibility with the admin delete flow's older
  // rows — no longer used to grant delete rights (deletion is admin-only now).
  const info = db
    .prepare('INSERT INTO orders (day, name, order_text, restaurant, token, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(day, name, order, restaurant, '', createdAt);

  return NextResponse.json(
    { id: info.lastInsertRowid, day, name, order, restaurant, created_at: createdAt },
    { status: 201 }
  );
}
