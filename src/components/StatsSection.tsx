export default function StatsSection() {
  const stats = [
    { label: "Vehicles Serviced", value: "1,200+", icon: "🚗" },
    { label: "Satisfied Customers", value: "850+", icon: "😊" },
    { label: "Expert Technicians", value: "15", icon: "🔧" },
    { label: "Years of Experience", value: "12", icon: "📅" },
  ]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 mb-12 text-white">
      <h2 className="text-2xl font-bold mb-8 text-center">By The Numbers</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center transform transition-transform hover:scale-105">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-blue-100">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
