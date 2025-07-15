import { Shield, Clock, PenToolIcon as Tool, Award } from "lucide-react"

export default function ValueProposition() {
  const values = [
    {
      title: "Quality Guarantee",
      description: "We stand behind our work with comprehensive warranties on parts and labor.",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      highlight: "Peace of mind with every service",
    },
    {
      title: "Time Efficiency",
      description: "We respect your time with quick turnarounds and convenient scheduling options.",
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      highlight: "Back on the road faster",
    },
    {
      title: "Technical Excellence",
      description: "Our technicians receive ongoing training to stay current with the latest vehicle technologies.",
      icon: <Tool className="h-8 w-8 text-blue-600" />,
      highlight: "Expert solutions for any problem",
    },
    {
      title: "Customer Focus",
      description: "We build lasting relationships through honest communication and exceptional service.",
      icon: <Award className="h-8 w-8 text-blue-600" />,
      highlight: "Your satisfaction is our priority",
    },
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Our Commitment to Excellence</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          At Ayal Tizazu's Garage, we're driven by core values that ensure you receive the highest quality service for
          your vehicle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 text-center h-full flex flex-col"
          >
            <div className="mx-auto mb-4 bg-blue-50 p-4 rounded-full">{value.icon}</div>
            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
            <p className="text-gray-600 mb-4">{value.description}</p>
            <div className="mt-auto">
              <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {value.highlight}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
