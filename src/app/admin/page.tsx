"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/landing/admin-dashboard/AdminDashboard"


const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Checking admin authentication...")
    const adminAuth = localStorage.getItem("adminAuth")
    const adminEmail = localStorage.getItem("adminEmail")

    console.log("[v0] Auth status:", { adminAuth, adminEmail })

    if (adminAuth === "true" && adminEmail) {
      console.log("[v0] User authenticated, showing dashboard")
      setIsAuthenticated(true)
    } else {
      console.log("[v0] User not authenticated, redirecting to login")
      router.push("/admin/login")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminDashboard />
}

export default AdminPage
