"use client"

import { useState, useEffect } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Abebe Kebede",
    role: "Business Owner",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Ayal Tizazu's Garage has been maintaining my fleet of delivery vehicles for years. Their service is exceptional and pricing transparent. I wouldn't trust my vehicles with anyone else.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sara Haile",
    role: "Doctor",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "As a busy professional, I need my car to be reliable. The team at Ayal Tizazu's Garage always ensures my vehicle is in perfect condition, and they work around my schedule.",
    rating: 5,
  },
  {
    id: 3,
    name: "Dawit Mekonnen",
    role: "Taxi Driver",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "My livelihood depends on my car being in top condition. The mechanics here understand this and provide fast, quality service that keeps me on the road.",
    rating: 4,
  },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Trusted by Customers Like You</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Don't just take our word for it. Here's what our customers have to say about their experience with us.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-blue-700 p-8 flex items-center justify-center">
            <div className="text-center text-white">
              <Quote className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-2xl font-bold mb-2">Customer Stories</h3>
              <p className="mb-6">Real experiences from real customers</p>
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeIndex ? "bg-white scale-125" : "bg-white/50"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-8">
            <div className="relative h-[250px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === activeIndex
                      ? "opacity-100 translate-x-0"
                      : index < activeIndex
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{testimonial.name}</h3>
                        <p className="text-gray-600">{testimonial.role}</p>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-lg flex-grow italic leading-relaxed">"{testimonial.content}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
