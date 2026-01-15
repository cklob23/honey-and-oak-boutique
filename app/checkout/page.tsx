"use client"

import { useEffect, useState, useMemo } from "react"
import { Elements, useStripe } from "@stripe/react-stripe-js"
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout"
import { stripePromise } from "@/lib/stripe"
import apiClient from "@/lib/api-client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import CheckoutForm from "@/components/checkout-form"
import ExpressCheckout from "@/components/express-checkout"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Package, Truck, Store, MapPin, Info } from "lucide-react"

const STORE_LOCATION = {
  lat: 34.00413,
  lng: -85.04309,
}

export default function CheckoutPage() {
  const cartId =
    typeof window !== "undefined" ? localStorage.getItem("cartId") : null

  const [cartItems, setCartItems] = useState<any[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [clientSecretPromise, setClientSecretPromise] =
    useState<Promise<string> | null>(null)

  const [deliveryMethod, setDeliveryMethod] =
    useState<"ship" | "pickup">("ship")

  const [guestEmail, setGuestEmail] = useState("")
  const [emailOptIn, setEmailOptIn] = useState(false)

  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  )
  const shipping = deliveryMethod === "pickup" || subtotal >= 100 ? 0 : 10
  const tax = Number((subtotal * 0.0775).toFixed(2))
  const total = subtotal + shipping + tax

  /* ---------------- Cart ---------------- */
  useEffect(() => {
    if (!cartId) return
    apiClient.get(`/cart/${cartId}`).then((res) => {
      setCartItems(res.data.items || [])
    })
  }, [cartId])

  /* ---------------- Stripe ---------------- */
  useEffect(() => {
    if (!cartId) return

    const loadPayment = async () => {
      const intent = await apiClient.post("/checkout", {
        cartId,
        email: guestEmail,
        shipping,
        deliveryMethod,
      })

      const promise = apiClient
        .post("/checkout/create-checkout-session", { cartId })
        .then((r) => r.data.clientSecret)

      setClientSecret(intent.data.clientSecret)
      setClientSecretPromise(promise)
    }

    loadPayment()
  }, [cartId, shipping, deliveryMethod, guestEmail])

  const pickupLocations = [
    {
      id: "honey-and-oak",
      name: "HONEY & OAK BOUTIQUE LLC",
      address: "220 Oakhill Drive, Rockmart GA",
      readyTime: "Usually ready in 3-5 business days",
      price: "FREE",
    },
  ]

  const STORE_LOCATION = {
    lat: 34.00413,
    lng: -85.04309,
  }

  const getDistanceMiles = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 3958.8 // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        const rawMiles = getDistanceMiles(
          latitude,
          longitude,
          STORE_LOCATION.lat,
          STORE_LOCATION.lng
        )

        const miles =
          rawMiles < 0.2 ? 0 : Number(rawMiles.toFixed(1))

        setDistanceMiles(miles)
        setShowLocationPrompt(false)
      },
      (error) => {
        alert("Unable to retrieve your location.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (!clientSecret) {
    return <div className="min-h-screen grid place-items-center">Loading…</div>
  }

  const appearance = {
    theme: 'flat',
    variables: {
      fontFamily: ' "Gill Sans", sans-serif',
      fontLineHeight: '1.5',
      borderRadius: '10px',
      colorBackground: '#F6F8FA',
      accessibleColorOnColorPrimary: '#262626'
    },
    rules: {
      '.Block': {
        backgroundColor: 'var(--colorBackground)',
        boxShadow: 'none',
        padding: '12px'
      },
      '.Input': {
        padding: '12px'
      },
      '.Input:disabled, .Input--invalid:disabled': {
        color: 'lightgray'
      },
      '.Tab': {
        padding: '10px 12px 8px 12px',
        border: 'none'
      },
      '.Tab:hover': {
        border: 'none',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
      },
      '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
        border: 'none',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
      },
      '.Label': {
        fontWeight: '500'
      }
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          {/* EXPRESS */}
          <Elements
            key={clientSecret}
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <h2 className="font-semibold">Express checkout</h2>
            <ExpressCheckout />
          </Elements>

          <Separator />

          {/* CONTACT */}
          <div>
            <h2 className="font-semibold mb-3">Contact</h2>
            <Input
              placeholder="Email address"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="h-12"
            />
            <label className="flex gap-2 mt-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
              />
              Email me with news and offers
            </label>
          </div>

          {/* Delivery */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Delivery</h2>

            <div className="space-y-3 mb-4">
              {/* SHIP */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border
                ${deliveryMethod === "ship"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent"}
              `}
              >
                <input
                  className="accent-foreground"
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "ship"}
                  onChange={() => {
                    setDeliveryMethod("ship")
                  }}
                />
                <Package className="w-5 h-5" />
                <span className="font-medium">Ship</span>
                <Truck className="w-5 h-5 text-muted-foreground ml-auto" />
              </label>

              {/* PICKUP */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border
                  ${deliveryMethod === "pickup"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent"}
                `}
              >
                <input
                  className="accent-foreground"
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "pickup"}
                  onChange={() => {
                    setDeliveryMethod("pickup")
                  }}
                />
                <Package className="w-5 h-5" />
                <span className="font-medium">Pick up</span>
                <Store className="w-5 h-5 text-muted-foreground ml-auto" />
              </label>
            </div>
            {deliveryMethod === "pickup" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Pickup locations</h3>
                  {showLocationPrompt ? (
                    <button
                      type="button"
                      onClick={() => setShowLocationPrompt(false)}
                      className="flex items-center gap-1 text-xs text-accent hover:underline cursor-pointer"
                    >
                      <span>cancel</span>
                    </button>) : (
                    <button
                      type="button"
                      onClick={() => setShowLocationPrompt(true)}
                      className="flex items-center gap-1 text-xs text-accent hover:bg-gray-100 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>US</span>
                    </button>)}
                </div>
                {showLocationPrompt ? (
                  <button
                    onClick={handleUseMyLocation}
                    className="
                      w-full
                      mt-3
                      flex
                      items-center
                      justify-center
                      gap-2
                      border
                      border-accent
                      text-accent
                      rounded-lg
                      h-12
                      hover:bg-accent/5
                      transition
                      cursor-pointer
                    "
                  >
                    <MapPin className="w-4 h-4" />
                    Use my location
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    There is {pickupLocations.length} location with stock close to you
                  </p>)}
                {!showLocationPrompt && pickupLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex justify-between gap-4 p-4 border-2 border-accent bg-accent/5 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {location.name}
                        {distanceMiles !== null && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            ({distanceMiles} mi)
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {location.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {location.readyTime}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-foreground">
                      {location.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "flat", variables: { colorPrimaryText: '#53321f' } },
            }}
          >
            <CheckoutForm
              returnUrl={`${window.location.origin}/checkout/complete`}
              disabled={!guestEmail}
            />
          </Elements>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="sticky top-24 border rounded-lg p-6 space-y-4">
          {cartItems.map((item, i) => (
            <div key={i} className="flex gap-3">
              <img
                src={item.image}
                className="w-16 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.color} / {item.size}
                </p>
              </div>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}

          <Separator />

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated taxes</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground mr-2">USD</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="
            w-full
            mt-4
            h-10
            bg-[#C8A882]
            hover:bg-[#B89872]
            text-white
            text-base
            font-semibold
          "
          >
            {submitting ? "Processing…" : "Pay now"}
          </Button>
          <Button variant="outline" asChild className="w-full h-10">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
