"use client"

import apiClient from "@/lib/api-client"
import { Customer } from "@/types"
import Link from "next/link"
import { useEffect, useState } from "react"



export function Footer() {

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("customerId")
    if (id) {
      apiClient.get(`/customers/${id}`).then(res => setCustomer(res.data))
    }
    setCustomerId(id)
  }, [])

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Honey & Oak</h3>
            <p className="text-sm text-background/80">Curated women's fashion for the modern, thoughtful woman.</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid">
              <li>
                <Link href="/shop?category=tops" className="hover:text-accent transition-colors">
                  Tops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-accent transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bottoms" className="hover:text-accent transition-colors">
                  Bottoms
                </Link>
              </li>
              <li>
                <Link href="/shop?category=self-care" className="hover:text-accent">
                  Self Care
                </Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="hover:text-accent transition-colors">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sale" className="hover:text-accent">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="hover:text-accent transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                {customer?.role === "admin" ? <Link href="/admin" className="hover:text-accent">
                  Admin Dashboard
                </Link> : null}
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/size-chart" className="hover:text-accent transition-colors">
                  Size Chart
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-accent transition-colors">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-background/80">© 2026 Honey & Oak Boutique. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Instagram
            </a>
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
