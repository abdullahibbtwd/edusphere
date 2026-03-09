import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  await redis.set('test', 'Redis is working!', 'EX', 60);
  const value = await redis.get('test');
  return NextResponse.json({ message: value });
}
