import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Delete the admin session cookie
    cookieStore.delete('admin_session')

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (err: any) {
    console.error('Admin logout error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
