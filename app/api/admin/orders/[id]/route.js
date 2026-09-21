import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { isValidAdminPassword } from '../../../../../lib/adminAuth';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  if (!isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 403 });
  }

  const db = getDb();
  const row = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!row) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
