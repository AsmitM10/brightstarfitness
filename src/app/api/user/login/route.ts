import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(req: Request) {
  try {
    const { username, whatsapp } = await req.json()

    if (!username || !whatsapp) {
      return NextResponse.json(
        { error: 'Username and WhatsApp number are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()
    
    // Verify user exists with matching credentials
    const { data: user, error } = await supabase
      .from('user4')
      .select('id, username, whatsapp_no, userpage_slug')
      .eq('username', username.trim())
      .eq('whatsapp_no', whatsapp.replace(/\D/g, ''))
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found. Please register first or check your credentials.' },
        { status: 401 }
      )
    }

    // Create JWT token with user info
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      slug: user.userpage_slug,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        userpage_slug: user.userpage_slug,
      },
    })
  } catch (err: any) {
    console.error('User login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
