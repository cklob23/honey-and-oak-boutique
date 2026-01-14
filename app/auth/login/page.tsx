"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.post("/auth/login", { email, password })
      console.log(response)
      localStorage.setItem("authToken", response.data.customer.sessionToken)
      localStorage.setItem("customerId", response.data.customer.customerId)
      localStorage.setItem("customerEmail", response.data.customer.email)

      router.push("/shop")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Redirect browser to backend Google OAuth route
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth/google`
  }
  
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Welcome to Honey & Oak Boutique</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Separator />
              <Button className="w-full" variant="outline" onClick={handleGoogleLogin}>
                <img
                  src="/google-icon.svg"
                  alt="Shop Pay"
                  className="h-4 w-auto object-contain"
                />
                <span>Sign in with Google</span>
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-accent hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
