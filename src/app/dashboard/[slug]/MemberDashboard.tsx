"use client"

import { useEffect, useState } from "react"
import {
  Copy,
  LogOut,
  Users,
  HelpCircle,
  Home,
  Play,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AttendanceTracker from "@/components/landing/AttendanceTracker"
import { createClient } from "@supabase/supabase-js"
import { Sidebar } from "lucide-react"

/* =========================
   Supabase
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================
   Types
========================= */
type UserData = {
  id: string
  username: string
  userpage_slug: string
  attendance: string[] | null
  created_at: string
  registration_date: string
  last_date: string
}
type ReferralUser = {
  username: string
  last_date: string
  userpage_slug: string
}

/* =========================
   Component
========================= */
export default function MemberDashboard({ data }: { data: UserData }) {
  const [activeTab, setActiveTab] = useState<"invite" | "attendance">("invite")
  const [activeSection, setActiveSection] = useState<"home" | "referrals" | "faqs" | "sessions">("home")
  const [copied, setCopied] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // referral list pulled from user5 table
const [referrals, setReferrals] = useState<ReferralUser[]>([])
const [sessions, setSessions] = useState<any[]>([])

  const userName = data.username
  // this is the url other people should visit to sign up via your referral
  const referralLink = `https://new-repo-alpha-snowy.vercel.app/${data.userpage_slug}`
  // your personal dashboard (7‑day session) url
  const dashboardLink = `https://new-repo-alpha-snowy.vercel.app/dashboard/${data.userpage_slug}`

  // query referrals when component mounts
 useEffect(() => {
  const loadReferrals = async () => {
    const { data: rows, error } = await supabase
      .from("user4")
      .select("username,last_date,userpage_slug")
      .eq("referrer", data.userpage_slug)

    if (!error && rows) {
      setReferrals(rows)
    }
  }

  const loadSessions = async () => {
    const { data: rows, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "scheduled")
      .gte("session_date", new Date().toISOString().split('T')[0])
      .order("session_date", { ascending: true })
      .order("session_time", { ascending: true })

    if (!error && rows) {
      setSessions(rows)
    }
  }

  loadReferrals()
  loadSessions()
}, [data.userpage_slug])

  /* =========================
     Attendance Helpers
  ========================= */
  const getTodayIndex = () => {
    const start = new Date(data.created_at).getTime()
    return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
  }

  useEffect(() => {
    const syncAttendance = async () => {
      const daysPassed = getTodayIndex()
      const attendance = [...(data.attendance || [])]
      let changed = false

      for (let i = 0; i < daysPassed; i++) {
        if (!attendance[i]) {
          attendance[i] = "A"
          changed = true
        }
      }

      if (changed) {
        await supabase
          .from("user4")
          .update({ attendance })
          .eq("userpage_slug", data.userpage_slug)
      }
    }

    syncAttendance()
  }, [data])

  const markTodayPresent = async () => {
    const todayIndex = getTodayIndex()
    const attendance = [...(data.attendance || [])]

    if (attendance[todayIndex]) return

    attendance[todayIndex] = "P"

    await supabase
      .from("user4")
      .update({ attendance })
      .eq("userpage_slug", data.userpage_slug)
  }

  /* =========================
     Actions
  ========================= */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppShare = () => {
    const message = `Join Bright Star Fitness and get FREE 7 Days Sessions!\n${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  /* =========================
     FAQ
  ========================= */
  const faqs = [
   {
      question: "What is the 7-day free online fitness session?",
      answer: "Our 7-day free online fitness session is a comprehensive program...",
    },
    {
      question: "How do I register for the free 7-day program?",
      answer: "Registration is simple! Just fill out the join form...",
    },
    {
      question: "Do I need to pay anything to join the 7-day trial?",
      answer: "No, the 7-day trial is completely free!",
    },
    {
      question: "Can I join from anywhere in the world?",
      answer: "Yes! Our online sessions are accessible from anywhere with internet.",
    },
    {
      question: "What kind of workouts are included in the 7-day session?",
      answer: "The program includes strength training, cardio, yoga, flexibility...",
    },
    {
      question: "Do I need to install any app?",
      answer: "No, you can join directly from the website via your dashboard.",
    },
    {
      question: "Can I share the session link with my friends or family?",
      answer: "Yes! Use the referral system in your dashboard.",
    },
    
  ]

  /* =========================
     UI (OLD DESIGN)
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg z-20">
        <div className="p-6 border-b flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">{userName}</span>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          <Button
            variant={activeSection === "home" ? "default" : "ghost"}
            className={`w-full justify-start ${activeSection === "home" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-gray-600"}`}
            onClick={() => setActiveSection("home")}
          >
            <Home className="w-4 h-4 mr-3" /> Home
          </Button>
          <Button
            variant={activeSection === "referrals" ? "default" : "ghost"}
            className={`w-full justify-start ${activeSection === "referrals" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-gray-600"}`}
            onClick={() => setActiveSection("referrals")}
          >
            <Users className="w-4 h-4 mr-3" /> Referrals
          </Button>
          <Button
            variant={activeSection === "sessions" ? "default" : "ghost"}
            className={`w-full justify-start ${activeSection === "sessions" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-gray-600"}`}
            onClick={() => setActiveSection("sessions")}
          >
            <Play className="w-4 h-4 mr-3" /> Sessions
          </Button>
          <Button
            variant={activeSection === "faqs" ? "default" : "ghost"}
            className={`w-full justify-start ${activeSection === "faqs" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-gray-600"}`}
            onClick={() => setActiveSection("faqs")}
          >
            <HelpCircle className="w-4 h-4 mr-3" /> FAQs
          </Button>
        
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-4 h-4 mr-3" /> Logout
          </Button>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        {/* Live Session Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-48">
            <img src="/images/utube.jpg" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center p-6">
              <Button className="bg-red-600" onClick={markTodayPresent}>
                <Play className="w-4 h-4 mr-2" /> Join Live
              </Button>
            </div>
          </div>
        </Card>

        {activeSection === "home" && (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("invite")}
                  className={activeTab === "invite" ? "border-b-2 border-teal-600 pb-2" : "pb-2"}
                >
                  Invite Friends
                </button>
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={activeTab === "attendance" ? "border-b-2 border-teal-600 pb-2" : "pb-2"}
                >
                  My Attendance
                </button>
              </div>
            </div>

            {activeTab === "invite" && (
              <Card className="p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Invite Friends</h3>
                <p className="text-gray-600 mb-6">Friends get FREE 7 Days Sessions</p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border rounded p-3 font-mono text-sm">
                    {referralLink}
                  </div>
                  <Button onClick={handleCopy}>
                    {copied ? <Check /> : <Copy />}
                  </Button>
                  <Button onClick={handleWhatsAppShare} className="bg-green-600">
                    WhatsApp
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "attendance" && (
              <Card className="p-8 shadow-lg">
                <AttendanceTracker 
                  attendance={data.attendance || []} 
                  created_at={data.created_at}
                  userpage_slug={data.userpage_slug}
                  registration_date={data.registration_date}
                  last_date={data.last_date}
                />
              </Card>
            )}
          </>
        )}
        {activeSection === "referrals" && (
          <div className="max-w-3xl">
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r bg-white text-black">
                <CardTitle className="text-2xl font-bold">Share and Invite</CardTitle>
                <p className="text-gray-700 mt-2">Invite friends and grow your network</p>
              </CardHeader>
              
              <CardContent>

                {/* Referral Link */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold mb-3">
                    Your Referral Link
                  </h3>

                  <div className="flex gap-3">

                    <div className="flex-1 border rounded p-3 font-mono text-sm break-all">
                      {referralLink}
                    </div>

                    <Button onClick={handleCopy}>
                      {copied ? <Check /> : <Copy />}
                    </Button>

                  </div>

                </div>

                {/* REFERRAL TABLE */}

                <div>

                  <h3 className="text-lg font-semibold mb-3">
                    Your Referrals
                  </h3>

                  {referrals.length === 0 ? (

                    <div className="bg-gray-50 rounded-lg p-6 border text-center">
                      No referrals yet
                    </div>

                  ) : (

                    <div className="border rounded-lg overflow-hidden">

                      <table className="w-full text-left">

                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>

                        <tbody>

                          {referrals.map((user, i) => {

                            const today = new Date()
                            const lastDate = new Date(user.last_date)

                            const status =
                              today > lastDate
                                ? "Completed"
                                : "Pending"

                            return (

                              <tr key={i} className="border-t">

                                <td className="p-3">
                                  {user.username}
                                </td>

                                <td className="p-3">

                                  <span
                                    className={`px-3 py-1 rounded-full text-sm ${
                                      status === "Completed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {status}
                                  </span>

                                </td>

                              </tr>

                            )

                          })}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </CardContent>
            </Card>
          </div>
        )}
        {activeSection === "sessions" && (
          <div className="max-w-3xl">
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r bg-white text-black">
                <CardTitle className="text-2xl font-bold">Upcoming Sessions</CardTitle>
                <p className="text-gray-700 mt-2">View your scheduled yoga sessions</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{session.session_time}</div>
                          <div className="text-sm text-gray-500">{new Date(session.session_date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          {session.meeting_link && (
                            <Button 
                              className="bg-teal-600 hover:bg-teal-700"
                              onClick={() => window.open(session.meeting_link, '_blank')}
                            >
                              Join Session
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No upcoming sessions scheduled.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeSection === "faqs" && (
          <div className="space-y-4 max-w-3xl">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent>
                  <button
                    className="w-full flex justify-between py-3"
                    onClick={() => setExpandedFAQ(i === expandedFAQ ? null : i)}
                  >
                    <span className="font-semibold">{faq.question}</span>
                    {expandedFAQ === i ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  {expandedFAQ === i && <p className="mt-2">{faq.answer}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          
        )}
        
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4 font-semibold">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
                No
              </Button>
              <Button onClick={() => (window.location.href = "/")}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}