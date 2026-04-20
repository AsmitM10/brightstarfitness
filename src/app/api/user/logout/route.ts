import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Delete the user session cookie
    cookieStore.delete('user_session')

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (err: any) {
    console.error('User logout error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
