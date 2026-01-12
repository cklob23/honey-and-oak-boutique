"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with backend for email subscription
    setIsSubscribed(true)
    setEmail("")
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <section className="py-16 md:py-24 bg-secondary border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-muted mb-8">
          Get early access to new arrivals, exclusive sales, and style tips delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background"
          />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Subscribe
          </Button>
        </form>

        {isSubscribed && (
          <p className="mt-4 text-sm text-accent font-medium">
            Thank you for subscribing! Check your email for exclusive offers.
          </p>
        )}

        <p className="text-xs text-muted mt-6">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  )
}
