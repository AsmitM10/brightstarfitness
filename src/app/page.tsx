"use client"
import { useState, useEffect } from "react"
import HeaderSection from "@/components/landing/HeaderSection"
import HeroSection from "@/components/landing/HeroSection"
import StatsSection from "@/components/landing/StatsSection"
import BatchesSection from "@/components/landing/BatchesSection"
import JoinFormSection from "@/components/landing/JoinFormSection"
import FooterSection from "@/components/landing/FooterSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import TrainerSection from "@/components/landing/TrainerSection"
import ImageCarousel from "@/components/landing/ImageCarousel"
import Benefits from "@/components/landing/Benefits"
import Features from "@/components/landing/Features"
import PricingSection from "@/components/landing/PricingSection"

export default function FitnessLanding() {
  const [candidateCount, setCandidateCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCandidateCount((prev) => {
        if (prev < 47) return prev + 1
        return prev
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const scrollToForm = () => {
    document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, #C3F7EF 0%, #CBFAF1 11.63%, #D7FAF4 23.25%, #DCFBF5 31.56%, #E1FBF7 39.87%, #E6FCF8 55.48%, #EBFCFA 71.08%, #F0FDFB 85.54%, #F5FEFC 92.77%, #FFFFFF 100%)",
        }}
      >
        <HeaderSection />
        <HeroSection />
        <div className="absolute left-4 md:left-16 bottom-4 md:bottom-20 animate-slide-in-left">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-[220px] border border-gray-200">
            <button
              onClick={scrollToForm}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium mb-2 w-full transition-colors duration-200"
            >
              Click here to join Challenge
            </button>
            <div className="text-sm text-gray-700">
              <span className="text-2xl font-semibold text-teal-600">{candidateCount}+</span>
              <span className="ml-1">candidates have already registered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mt-16 stagger-animation">
          <StatsSection />
        </div>
        <div className="stagger-animation">
          <BatchesSection />
        </div>
        <div className="stagger-animation">
          <JoinFormSection />
        </div>
        <div className="stagger-animation">
          <TrainerSection />
        </div>
        <div className="stagger-animation">
          <ImageCarousel />
        </div>
        <div className="stagger-animation">
          <TestimonialsSection />
        </div>
        <div className="stagger-animation">
          <PricingSection />
        </div>
        <div className="stagger-animation">
          <Benefits />
        </div>
        <div className="stagger-animation">
          <Features />
        </div>
        <FooterSection />
      </div>
    </div>
  )
}
