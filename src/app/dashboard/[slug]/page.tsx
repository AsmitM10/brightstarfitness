import { createSupabaseServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyUserToken } from "@/lib/auth/verifyToken"
import MemberDashboard from "./MemberDashboard"

export interface UserData {
  id: string
  username: string
  userpage_slug: string
  attendance: string[] | null
  created_at: string
  registration_date: string
  last_date: string
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Server-side authentication check (defense in depth)
  const cookieStore = await cookies()
  const userSession = cookieStore.get('user_session')

  if (!userSession) {
    redirect('/?login=required')
  }

  // Verify JWT token
  const userPayload = await verifyUserToken(userSession.value)
  
  if (!userPayload) {
    redirect('/?login=expired')
  }

  // Verify user is accessing their own dashboard
  if (userPayload.slug !== slug) {
    redirect('/?error=unauthorized')
  }

  const supabase = createSupabaseServerClient()

  // Fetch user data - now we know it's authenticated and authorized
  const { data, error } = await supabase
    .from("user4")
    .select("*")
    .eq("userpage_slug", slug)
    .eq("id", userPayload.userId) // Additional security: verify ID matches
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Error loading dashboard</p>
      </div>
    )
  }

  return <MemberDashboard data={data as UserData} />
}
