export default function ServicesSection() {
  const services = [
    {
      title: "Preventive Maintenance",
      description: "Regular check-ups that extend your vehicle's life and prevent costly breakdowns.",
      icon: "🔧",
      color: "bg-blue-100 text-blue-800",
      benefits: ["Improved reliability", "Better fuel efficiency", "Extended vehicle lifespan"],
    },
    {
      title: "Engine Diagnostics & Repair",
      description: "Advanced diagnostic technology to identify and fix engine issues with precision.",
      icon: "⚙️",
      color: "bg-green-100 text-green-800",
      benefits: ["Restored performance", "Reduced emissions", "Quieter operation"],
    },
    {
      title: "Brake System Service",
      description: "Comprehensive brake inspection and repair for your safety and peace of mind.",
      icon: "🛑",
      color: "bg-red-100 text-red-800",
      benefits: ["Shorter stopping distance", "Improved safety", "Elimination of noise and vibration"],
    },
    {
      title: "Electrical System Solutions",
      description: "Expert troubleshooting and repair of complex vehicle electrical systems.",
      icon: "⚡",
      color: "bg-yellow-100 text-yellow-800",
      benefits: ["Reliable starting", "Properly functioning accessories", "Prevention of battery drain"],
    },
    {
      title: "Climate Control Service",
      description: "Keep your vehicle comfortable in any weather with our A/C and heating system services.",
      icon: "❄️",
      color: "bg-cyan-100 text-cyan-800",
      benefits: ["Optimal temperature control", "Improved air quality", "Efficient operation"],
    },
    {
      title: "Complete Tire Care",
      description: "From rotation to replacement, we ensure your tires provide optimal safety and performance.",
      icon: "🛞",
      color: "bg-purple-100 text-purple-800",
      benefits: ["Extended tire life", "Better handling", "Improved fuel economy"],
    },
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Services Designed Around Your Needs</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          We offer comprehensive vehicle care solutions that keep you on the road with confidence. Each service is
          performed by certified technicians using state-of-the-art equipment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
          >
            <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center text-2xl mb-4`}>
              {service.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="mt-auto">
              <h4 className="font-medium text-sm text-gray-700 mb-2">BENEFITS:</h4>
              <ul className="space-y-1">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-green-500">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
