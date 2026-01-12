import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SizeChartPage() {
  const charts = [
    {
      category: "Shirts",
      sizes: [
        { size: "XS", chest: '31-33"', length: '26"' },
        { size: "S", chest: '34-36"', length: '27"' },
        { size: "M", chest: '37-39"', length: '28"' },
        { size: "L", chest: '40-42"', length: '29"' },
        { size: "XL", chest: '43-45"', length: '30"' },
        { size: "XXL", chest: '46-48"', length: '31"' },
      ],
    },
    {
      category: "Pants",
      sizes: [
        { size: "XS", waist: '24"', inseam: '28"' },
        { size: "S", waist: '26"', inseam: '28.5"' },
        { size: "M", waist: '28"', inseam: '29"' },
        { size: "L", waist: '30"', inseam: '29.5"' },
        { size: "XL", waist: '32"', inseam: '30"' },
        { size: "XXL", waist: '34"', inseam: '30.5"' },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Size Chart</h1>
          <p className="text-muted-foreground">
            Find the perfect fit with our detailed size guide. All measurements in inches.
          </p>
        </div>

        <div className="space-y-12">
          {charts.map((chart) => (
            <div key={chart.category}>
              <h2 className="text-2xl font-semibold text-foreground mb-6">{chart.category}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      {Object.keys(chart.sizes[0]).map((key) => (
                        <th
                          key={key}
                          className="border border-border px-4 py-3 text-left font-semibold text-foreground"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.sizes.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx} className="border border-border px-4 py-3 text-foreground">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-secondary rounded-xl p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">How to Measure</h3>
          <ul className="space-y-3 text-muted">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">Chest:</span>
              Measure around the fullest part of your chest, keeping the tape parallel to the ground.
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">Length:</span>
              Measure from the highest point of your shoulder to the desired hem length.
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">Waist:</span>
              Measure around your natural waist, keeping the tape snug but not tight.
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">Inseam:</span>
              Measure from your inner thigh to your ankle while standing straight.
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  )
}
