import { CheckCircle } from "lucide-react"

export default function WhyChooseUs() {
  const benefits = [
    {
      title: "Expert Technicians",
      description: "Our certified mechanics have years of experience working with all vehicle types and brands.",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees or surprises. We provide detailed estimates before any work begins.",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Quality Parts",
      description: "We use only genuine or high-quality aftermarket parts for all repairs and maintenance.",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Warranty Protection",
      description: "All our repairs come with a comprehensive warranty for your peace of mind.",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Why Choose Ayal Tizazu's Garage?</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          We're committed to providing exceptional service that keeps your vehicles running at their best. Our approach
          combines technical expertise with honest communication and fair pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-start">
              <div className="mr-4 mt-1">{benefit.icon}</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
