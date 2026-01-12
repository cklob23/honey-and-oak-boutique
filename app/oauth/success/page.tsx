"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"

export default function OAuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const response = await apiClient.get("/auth/me", {
          withCredentials: true,
        })

        localStorage.setItem(
          "authToken",
          response.data.customer.sessionToken
        )
        localStorage.setItem(
          "customerId",
          response.data.customer.customerId
        )
        localStorage.setItem(
          "customerEmail",
          response.data.customer.email
        )

        router.replace("/account")
      } catch (err) {
        router.replace("/auth/login")
      }
    }

    hydrateAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing you in…</p>
    </div>
  )
}
