import { createSupabaseServerClient } from "@/lib/supabase/server"
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

  console.log("PAGE HIT — SLUG:", slug)

  const supabase = await createSupabaseServerClient()
  console.log("SUPABASE CLIENT READY")

  // fetch exactly one user row matching the slug
  const { data, error } = await supabase
    .from("user4")
    .select("*")
    .eq("userpage_slug", slug)
    .single()

  console.log("SUPABASE DATA:", data)
  console.log("SUPABASE ERROR:", error)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Error loading user</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">User Not Found</p>
      </div>
    )
  }

  return <MemberDashboard data={data as UserData} />
}
