"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, ArrowRight } from "lucide-react"

type AuthState = "login" | "signup" | "verify" | "reset" | "success"

export default function AdminLogin() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""])
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    // Simple admin validation - in real app, this would be server-side
    if (email === "admin@brightstarfitness.com" && password === "admin123") {
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminEmail", email)
      if (rememberPassword) {
        localStorage.setItem("adminRememberMe", "true")
      }
      router.push("/admin")
    } else {
      setError("Invalid email or password")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !username || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    localStorage.setItem("adminAuth", "true")
    localStorage.setItem("adminEmail", email)
    localStorage.setItem("adminUsername", username)
    router.push("/admin")
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("")

    if (code.length !== 5) {
      setError("Please enter the complete verification code")
      return
    }

    localStorage.setItem("adminAuth", "true")
    localStorage.setItem("adminEmail", email)
    router.push("/admin")
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    localStorage.setItem("adminAuth", "true")
    localStorage.setItem("adminEmail", email)
    router.push("/admin")
  }

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${authState}-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${authState}-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative gradient shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-700/50">
        {/* Login Form */}
        {authState === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-700"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthState("reset")}
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-400 text-sm">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setAuthState("signup")}
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Create one
              </button>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {authState === "signup" && (
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-slate-400 text-sm">Set up your admin account to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="your_username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-400 text-sm">Already have an account? </span>
              <button
                type="button"
                onClick={() => setAuthState("login")}
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* Email Verification */}
        {authState === "verify" && (
          <form onSubmit={handleVerification} className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-slate-400 text-sm">We sent a verification code to your email address. Enter the 5-digit code below.</p>
            </div>

            <div className="flex justify-center gap-2">
              {verificationCode.map((digit, index) => (
                <div key={index}>
                  <label htmlFor={`code-${authState}-${index}`} className="sr-only">
                    Verification code digit {index + 1}
                  </label>
                  <input
                    id={`code-${authState}-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="0"
                    title={`Verification code digit ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
            >
              Verify Code
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-400 text-sm">Didn't receive the code? </span>
              <button type="button" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                Resend
              </button>
            </div>
          </form>
        )}

        {/* Password Reset */}
        {authState === "reset" && (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-slate-400 text-sm">Create a strong new password for your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
            >
              Update Password
            </button>

            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setAuthState("login")}
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* Success State */}
        {authState === "success" && (
          <div className="text-center space-y-8">
            <div>
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
              <p className="text-slate-400 text-sm">Your account has been created successfully. Redirecting to dashboard...</p>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("adminAuth", "true")
                localStorage.setItem("adminEmail", email)
                router.push("/admin")
              }}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
