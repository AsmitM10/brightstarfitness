import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function verifyAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  
  return adminSession && adminSession.value === 'authenticated'
}

export async function requireAdminAuth() {
  const isAuthenticated = await verifyAdminAuth()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    )
  }
  
  return null
}
