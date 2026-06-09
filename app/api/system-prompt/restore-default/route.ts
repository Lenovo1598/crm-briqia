import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function POST() {
  const defaultPrompt = await queryOne(
    'SELECT * FROM system_prompts WHERE is_default = TRUE LIMIT 1'
  );

  if (!defaultPrompt) {
    return NextResponse.json({ error: 'No default prompt found' }, { status: 404 });
  }

  // Desactivar todos
  await query('UPDATE system_prompts SET is_active = FALSE');

  // Activar el default
  await query('UPDATE system_prompts SET is_active = TRUE WHERE id = $1', [defaultPrompt.id]);

  return NextResponse.json({ success: true, content: defaultPrompt.content });
}
