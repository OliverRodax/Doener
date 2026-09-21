import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '../../../../lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ok = isValidAdminPassword(body.password);
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
