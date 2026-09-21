import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  const db = getDb();
  const row = db.prepare('SELECT token FROM orders WHERE id = ?').get(id);

  if (!row) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }
  if (!token || row.token !== token) {
    return NextResponse.json({ error: 'Nur die eigene Bestellung kann gelöscht werden.' }, { status: 403 });
  }

  db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
