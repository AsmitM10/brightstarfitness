"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import LoginModal from "./LoginModal"

export default function HeaderSection() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (section: string) => {
    if (section === "home") {
      router.push("/")
    } else {
      router.push(`/${section}`)
    }
    setMobileMenuOpen(false)
  }

  const isCurrentPage = (section: string) => {
    if (section === "home") {
      return pathname === "/"
    }
    return pathname === `/${section}`
  }

  return (
    <>
         <header
        className="sticky top-0 z-40 py-2 px-4"
        style={{
          background:
            "linear-gradient(180deg, #C3F7EE 0%, #D7FAF4 23.25%, #E1FBF7 39.87%, #EBFCFA 71.08%, #F5FEFC 85.5%, #FFFFFF 100%)",
        }}
      >
        {/* Rounded navbar container now stretches full width */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-md rounded-md h-12 px-6 py-3 shadow-sm w-full">
          {/* Left: Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation("home")}
          >
            <img src="/logo.svg" alt="Bright Star Fitness Logo" className="h-10 w-auto" />
          </motion.div>

          {/* Center: Nav (Desktop only) */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden md:flex gap-8 text-sm font-medium text-gray-700"
          >
            {["home", "trainer", "benefits", "testimonials", "features"].map((section) => (
              <button
                key={section}
                onClick={() => handleNavigation(section)}
                className={`hover:text-teal-600 transition-colors duration-200 ${
                  isCurrentPage(section) ? "text-teal-600 font-semibold underline underline-offset-4" : ""
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </motion.nav>

          {/* Right: Login + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Login Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="outline"
                className="w-[80px] h-[36px] bg-[#1A8B79]  text-white border-[#1A8B79] hover:bg-[#156b5c] hover:border-[#156b5c] rounded-md text-sm font-medium"
              >
                Login
              </Button>
            </motion.div>

            {/* Hamburger Menu (Mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-gray-200"
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" title="Close menu">
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-lg">
              {["home", "trainer", "benefits", "testimonials", "features"].map((section) => (
                <button
                  key={section}
                  onClick={() => handleNavigation(section)}
                  className={`text-left hover:text-teal-600 transition-colors duration-200 ${
                    isCurrentPage(section)
                      ? "text-teal-600 font-semibold underline underline-offset-4"
                      : "text-gray-700"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
