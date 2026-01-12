import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "sonner"
import {Elements} from '@stripe/react-stripe-js'
import { stripePromise } from "@/lib/stripe"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    // Customizable with appearance API.
    appearance: {/*...*/},
  }

export const metadata: Metadata = {
  title: "Honey & Oak Boutique",
  description:
    "Discover curated women's clothing at Honey & Oak Boutique. From elegant basics to statement pieces, find your style.",
  generator: "v0.app",
  icons: {
    icon: "/images/honey-20logo.png",
    apple: "/images/honey-20logo.png",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
        {/* Sonner Toast Notifications */}
        <Toaster
          position="top-left"
          richColors
          closeButton
          //theme="light"
          toastOptions={{
            duration: 1500,
            className: "shadow-lg border",
          }}
        />
      </body>
    </html>
  )
}
