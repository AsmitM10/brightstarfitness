"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// supabase client for client-side reads (anon key is ok)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralLink, setShowReferralLink] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Use secure login API that creates server-side session
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name.trim(),
          whatsapp: whatsapp.replace(/\D/g, ""),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Login failed. Please try again.")
        return
      }

      // Store minimal user info in localStorage (optional, for UI purposes only)
      localStorage.setItem("currentUser", JSON.stringify(result.user))

      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'https://bsfitness.com'
      
      const userReferralLink = `${baseUrl}/${result.user.userpage_slug}`
      setReferralLink(userReferralLink)
      setShowReferralLink(true)

      setTimeout(() => {
        router.push(`/dashboard/${result.user.userpage_slug}`)
      }, 2000)
    } catch (err) {
      console.error('Login error:', err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    alert("Referral link copied to clipboard!")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        {showReferralLink ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Login Successful!</h2>
            <p className="text-teal-700 mb-4">Your personal referral link:</p>
            <div className="bg-gray-100 p-3 rounded-md mb-4 break-all text-sm text-gray-700">{referralLink}</div>
            <Button onClick={copyReferralLink} className="w-full bg-teal-700 hover:bg-teal-800 text-white mb-3">
              Copy Referral Link
            </Button>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Login</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  placeholder="Enter your WhatsApp number"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogin}
                  className="flex-1 bg-[#1A8B79] hover:bg-[#156b5c] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
