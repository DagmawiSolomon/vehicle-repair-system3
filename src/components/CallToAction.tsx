import { ArrowRight } from "lucide-react"

export default function CallToAction() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-10 mb-16 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Experience Premium Vehicle Care?</h2>
        <p className="text-xl mb-8">
          Join our satisfied customers who trust us with their vehicles. Whether you need routine maintenance or complex
          repairs, we're here to help.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
            Schedule Service
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
            Learn More About Our Services
          </button>
        </div>
      </div>
    </div>
  )
}
