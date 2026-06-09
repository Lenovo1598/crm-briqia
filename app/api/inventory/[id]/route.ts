import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await query('DELETE FROM inventory_items WHERE id = $1', [id]);

  return NextResponse.json({ success: true });
}
