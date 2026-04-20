import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface UserPayload {
  userId: string
  username: string
  slug: string
}

export async function verifyUserToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Validate payload has required fields
    if (
      typeof payload.userId === 'string' &&
      typeof payload.username === 'string' &&
      typeof payload.slug === 'string'
    ) {
      return {
        userId: payload.userId,
        username: payload.username,
        slug: payload.slug,
      }
    }
    
    return null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
