import { NextResponse } from 'next/server';
import { getDb, todayBerlin } from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || todayBerlin();
  const token = searchParams.get('token') || '';

  const db = getDb();
  const rows = db
    .prepare('SELECT id, name, order_text, token, created_at FROM orders WHERE day = ? ORDER BY created_at ASC')
    .all(day);

  const orders = rows.map((r) => ({
    id: r.id,
    name: r.name,
    order: r.order_text,
    created_at: r.created_at,
    mine: token !== '' && r.token === token,
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
  const token = String(body.token || '').trim().slice(0, 100);

  if (!name || !order || !token) {
    return NextResponse.json({ error: 'Name, Bestellung und Token sind erforderlich.' }, { status: 400 });
  }

  const day = todayBerlin();
  const createdAt = new Date().toISOString();

  const db = getDb();
  const info = db
    .prepare('INSERT INTO orders (day, name, order_text, token, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(day, name, order, token, createdAt);

  return NextResponse.json(
    { id: info.lastInsertRowid, day, name, order, created_at: createdAt, mine: true },
    { status: 201 }
  );
}
