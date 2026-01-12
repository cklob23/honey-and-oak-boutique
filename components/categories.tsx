import Link from "next/link"

const categories = [
  {
    id: "tops",
    name: "Shirts & Blouses",
    description: "From crisp linens to luxe silks",
    image: "/shirt-category.jpg",
  },
  {
    id: "bottoms",
    name: "Pants & Trousers",
    description: "Tailored fits for every style",
    image: "/pants-category.jpg",
  },
  {
    id: "sets",
    name: "Matching Sets",
    description: "Coordinated looks ready to wear",
    image: "/matching-sets-category.jpg",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "The perfect finishing touch",
    image: "/accessories-category.png",
  },
]

export function Categories() {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.id}`}>
              <div className="group cursor-pointer">
                <div className="relative bg-muted rounded-xl overflow-hidden aspect-square mb-4">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
