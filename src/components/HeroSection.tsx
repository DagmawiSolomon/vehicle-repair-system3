"use client"

import { useState, useEffect } from "react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: "Expert Care for Your Vehicle",
      description: "We combine technical expertise with personalized service to keep your vehicle in peak condition.",
      cta: "Schedule Service",
    },
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: "Quality That Builds Trust",
      description: "Our certified technicians use advanced diagnostics and quality parts for reliable repairs.",
      cta: "Our Services",
    },
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: "Transparent and Fair Pricing",
      description: "No surprises or hidden fees. We provide detailed estimates before any work begins.",
      cta: "Learn More",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-xl mb-16">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          <div className="absolute inset-0 flex flex-col items-start justify-center text-white p-12 md:p-20">
            <div className="max-w-2xl">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 transform transition-transform duration-700"
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                  transform: index === currentSlide ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {slide.title}
              </h2>
              <p
                className="text-lg md:text-xl mb-8 transform transition-transform duration-700"
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {slide.description}
              </p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transform transition-transform duration-700"
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
