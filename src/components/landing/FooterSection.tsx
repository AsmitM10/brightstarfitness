"use client"
import { motion } from "framer-motion"
import { Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react"

export default function FooterSection() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-black text-white py-12 px-6"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="space-y-6">
          <div className="flex flex-col items-start gap-3">
              <img src="/logo.svg" alt="Bright Star Fitness Logo" className="h-10 w-auto" />
            <div>
              <h3 className="text-xl font-bold leading-relaxed">Transform Your Body</h3>
            </div>
          </div>

          {/* Description */}
          <div className="text-gray-300 leading-relaxed">
            <p>
              Transform Your Body with Bright Stars Fitness, Your Trusted Partner in Fitness. With Over{" "}
              <span className="text-blue-400 font-semibold">9 Years</span> of Experience, We Offer Expert Coaching,
              Tailored Workout Plans, and Comprehensive Nutritional Guidance.{" "}
              <span className="text-blue-400 font-semibold cursor-pointer hover:underline">Join Our Community</span> and
              Start Your Journey Towards a Healthier, Stronger You. Ready to Make a Change?
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Right Section - Contact Us */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Contact Us</h3>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="text-gray-300">
                <p>Mhatre Garden, Above</p>
                <p>Utkarsha Gym,</p>
                <p>Kannamwar Nagar 2,</p>
                <p>Vikhroli</p>
                <p>(E),Mumbai-400083</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">85918 74914</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">bsf1029@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Bright Star Fitness. All rights reserved.
      </div>
    </motion.footer>
  )
}
