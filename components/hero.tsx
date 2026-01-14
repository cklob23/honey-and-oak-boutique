import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-secondary via-background to-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-accent uppercase tracking-wide">New Collection</p>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground text-balance">
                Elevated Essentials for Modern Women
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover our curated selection of timeless pieces that blend comfort with contemporary style. From
                everyday basics to statement pieces, find your perfect fit.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/shop">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">New Arrivals</Button>
              </Link>
              <Link href="/gift-cards">
                <Button variant="outline">View Gift Cards</Button>
              </Link>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            <img
              src="/elegant-women-s-clothing-display.jpg"
              alt="Hero image showing elegant women's clothing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
