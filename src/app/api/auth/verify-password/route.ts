import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password, hash } = await request.json();

    if (!password || !hash) {
      return NextResponse.json(
        { error: 'Password and hash are required' },
        { status: 400 }
      );
    }

    const match = bcrypt.compareSync(password, hash);

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Error verifying password' },
      { status: 500 }
    );
  }
}
