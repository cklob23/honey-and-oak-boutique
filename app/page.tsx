import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { NewArrivals } from "@/components/new-arrivals"
import { Categories } from "@/components/categories"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <NewArrivals />
      <Categories />
      <Newsletter />
      <Footer />
    </main>
  )
}
