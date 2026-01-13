"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Info, Truck, Store, MapPin, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { CartItem } from "@/types"
import apiClient from "@/lib/api-client"
import { useCart } from "@/context/cart-context"
import { Elements } from "@stripe/react-stripe-js"
import { stripePromise } from "@/lib/stripe"
import ExpressCheckout from "@/components/express-checkout"
import { toast } from "sonner"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState("ship")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<"free" | "flat">("free")
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null)
  const cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { refreshCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)


  useEffect(() => {
    const id = localStorage.getItem("customerId")
    if (id) {
      setCustomerId(id)
    }
  }, [])

  // Load cart
  useEffect(() => {
    if (!cartId) return

    const fetchCart = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`/cart/${cartId}`)
        setCartItems(response.data?.items || [])
        setLoading(false)
      } catch (error: any) {
        if (error.response?.status === 404) {
          setCartItems([])
        }
      }
    }

    fetchCart()
  }, [cartId])

  useEffect(() => {
    if (!cartId || !customerId) return

    const createCheckoutIntent = async () => {
      try {
        const response = await apiClient.post("/checkout", {
          cartId,
          customerId,
        })
        console.log(response.data.clientSecret)
        setClientSecret(response.data.clientSecret)
      } catch (err) {
        console.error("Failed to start checkout", err)
        setClientSecret(null)
      }
    }

    createCheckoutIntent()
  }, [cartId, customerId])

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading checkout…
      </div>
    )
  }

  // Update item quantity
  const updateQuantity = async (index: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(index)
    } else {
      try {
        await apiClient.put(`/cart/${cartId}/items/${index}`, { quantity })
        setCartItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, quantity } : item
          )
        )
        refreshCart()
      } catch (err) {
        console.error("Failed to update item quantity:", err)
      }
    }
  }

  // Remove item
  const removeItem = async (index: number) => {
    try {
      await apiClient.delete(`/cart/${cartId}/items/${index}`)
      refreshCart()
      setCartItems((prev) => prev.filter((_, i) => i !== index))
    } catch (err) {
      console.error("Failed remove:", err)
    }
  }


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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.07
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Checkout Form */}
          <div className="space-y-6">
            <div>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <h2 className="text-sm font-semibold mb-3">Express checkout</h2>
                <ExpressCheckout />
              </Elements>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Contact</h2>
                {!customerId && (
                  <Link href="/auth/login" className="text-sm text-accent hover:underline">
                    Sign in
                  </Link>
                )}
              </div>
              <Input type="email" placeholder="Email or mobile phone number" className="h-12" />
              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" className="accent-foreground rounded" />
                <span className="text-sm text-muted-foreground">Email me with news and offers</span>
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
                    onChange={() => setDeliveryMethod("ship")}
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
                    onChange={() => setDeliveryMethod("pickup")}
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
              {deliveryMethod === "ship" && (
                <>
                  <div className="space-y-3">
                    <Select>
                      <SelectTrigger className="h-12 py-5 mt-1">
                        <SelectValue placeholder="Country/Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="First name" className="h-12" />
                      <Input placeholder="Last name" className="h-12" />
                    </div>
                    <Input placeholder="Address" className="h-12" />
                    <Input placeholder="Apartment, suite, etc. (optional)" className="h-12" />
                    <div className="grid grid-cols-3 gap-3">
                      <Input placeholder="City" className="h-12" />
                      <Select>
                        <SelectTrigger className="h-12 py-5 mt-1">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="al">Alabama</SelectItem>
                          <SelectItem value="ak">Alaska</SelectItem>
                          <SelectItem value="az">Arizona</SelectItem>
                          <SelectItem value="ar">Arkansas</SelectItem>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="co">Colorado</SelectItem>
                          <SelectItem value="ct">Connecticut</SelectItem>
                          <SelectItem value="de">Delaware</SelectItem>
                          <SelectItem value="fl">Florida</SelectItem>
                          <SelectItem value="ga">Georgia</SelectItem>
                          <SelectItem value="hi">Hawaii</SelectItem>
                          <SelectItem value="id">Idaho</SelectItem>
                          <SelectItem value="il">Illinois</SelectItem>
                          <SelectItem value="in">Indiana</SelectItem>
                          <SelectItem value="ia">Iowa</SelectItem>
                          <SelectItem value="ks">Kansas</SelectItem>
                          <SelectItem value="ky">Kentucky</SelectItem>
                          <SelectItem value="la">Louisiana</SelectItem>
                          <SelectItem value="me">Maine</SelectItem>
                          <SelectItem value="md">Maryland</SelectItem>
                          <SelectItem value="ma">Massachusetts</SelectItem>
                          <SelectItem value="mi">Michigan</SelectItem>
                          <SelectItem value="mn">Minnesota</SelectItem>
                          <SelectItem value="ms">Mississippi</SelectItem>
                          <SelectItem value="mo">Missouri</SelectItem>
                          <SelectItem value="mt">Montana</SelectItem>
                          <SelectItem value="ne">Nebraska</SelectItem>
                          <SelectItem value="nv">Nevada</SelectItem>
                          <SelectItem value="nh">New Hampshire</SelectItem>
                          <SelectItem value="nj">New Jersey</SelectItem>
                          <SelectItem value="nm">New Mexico</SelectItem>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="nc">North Carolina</SelectItem>
                          <SelectItem value="nd">North Dakota</SelectItem>
                          <SelectItem value="oh">Ohio</SelectItem>
                          <SelectItem value="ok">Oklahoma</SelectItem>
                          <SelectItem value="or">Oregon</SelectItem>
                          <SelectItem value="pa">Pennsylvania</SelectItem>
                          <SelectItem value="ri">Rhode Island</SelectItem>
                          <SelectItem value="sc">South Carolina</SelectItem>
                          <SelectItem value="sd">South Dakota</SelectItem>
                          <SelectItem value="tn">Tennessee</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="ut">Utah</SelectItem>
                          <SelectItem value="vt">Vermont</SelectItem>
                          <SelectItem value="va">Virginia</SelectItem>
                          <SelectItem value="wa">Washington</SelectItem>
                          <SelectItem value="wv">West Virginia</SelectItem>
                          <SelectItem value="wi">Wisconsin</SelectItem>
                          <SelectItem value="wy">Wyoming</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="ZIP code" className="h-12" />
                    </div>
                    <Input placeholder="Phone (optional)" className="h-12" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-muted-foreground">Text me with news and offers</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Shipping Method */}
            {deliveryMethod === "ship" && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Shipping method
                </h2>

                <div className="space-y-3">
                  {/* FREE SHIPPING */}
                  <label
                    className={`
                    flex items-center justify-between
                    p-4 rounded-lg border-2 cursor-pointer
                    transition-colors
                    ${subtotal > 100
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:border-accent"
                      }
                  `}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={subtotal > 100}
                        onChange={() => setShippingMethod("free")}
                        className="mt-1 accent-foreground"
                      />

                      <div>
                        <p className="text-sm font-semibold">FREE SHIPPING</p>
                        <p className="text-xs text-muted-foreground">{subtotal > 100
                          ? "Ready to ship"
                          : "Free shipping on orders over $100"
                        }</p>
                      </div>
                    </div>

                    <div className="text-sm font-semibold">FREE</div>
                  </label>

                  {/* FLAT RATE */}
                  <label
                    className={`
                    flex items-center justify-between
                    p-4 rounded-lg border cursor-pointer
                    transition-colors
                    ${subtotal < 100
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:border-accent"
                      }
                  `}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={subtotal < 100}
                        onChange={() => setShippingMethod("flat")}
                        className="mt-1 accent-foreground"
                      />

                      <div>
                        <p className="text-sm font-medium">Flat rate</p>
                        <p className="text-xs text-muted-foreground">Ready to ship</p>
                      </div>
                    </div>

                    <div className="text-sm font-semibold">$10.00</div>
                  </label>
                </div>
              </div>
            )}

            {/* Payment */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">Payment</h2>
              <p className="text-xs text-muted-foreground mb-4">All transactions are secure and encrypted.</p>

              <div className="space-y-3">
                {/* Credit Card Option */}
                <label className="block">
                  <div
                    className={`
                    flex items-center justify-between
                    p-4
                    rounded-lg
                    cursor-pointer
                    transition-colors
                    ${paymentMethod === "card"
                        ? "border-2 border-accent bg-accent/10"
                        : "border border-border bg-background hover:border-accent/50"
                      }
                  `}
                  >
                    {/* LEFT: Radio + Label */}
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-foreground"
                      />
                      <span className="font-medium">Credit card</span>
                    </div>

                    {/* RIGHT: Card Logos (Square Accepted Only) */}
                    <div className="relative group flex items-center gap-2">
                      {/* VISA */}
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                          alt="Visa"
                          className="h-4 w-auto object-contain"
                        />
                      </div>

                      {/* MASTERCARD */}
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-4 w-auto object-contain"
                        />
                      </div>

                      {/* AMEX */}
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
                          alt="American Express"
                          className="h-4 w-auto object-contain"
                        />
                      </div>

                      {/* DISCOVER */}
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                          <path fill="#E1E7EA" d="M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z"></path><path fill="#FF6D00" d="M45,35c0,2.2-1.8,4-4,4H16c0,0,23.6-3.8,29-15V35z M22,24c0,1.7,1.3,3,3,3s3-1.3,3-3c0-1.7-1.3-3-3-3S22,22.3,22,24z"></path><path d="M11.2,21h1.1v6h-1.1V21z M17.2,24c0,1.7,1.3,3,3,3c0.5,0,0.9-0.1,1.4-0.3v-1.3c-0.4,0.4-0.8,0.6-1.4,0.6c-1.1,0-1.9-0.8-1.9-2c0-1.1,0.8-2,1.9-2c0.5,0,0.9,0.2,1.4,0.6v-1.3c-0.5-0.2-0.9-0.4-1.4-0.4C18.5,21,17.2,22.4,17.2,24z M30.6,24.9L29,21h-1.2l2.5,6h0.6l2.5-6h-1.2L30.6,24.9z M33.9,27h3.2v-1H35v-1.6h2v-1h-2V22h2.1v-1h-3.2V27z M41.5,22.8c0-1.1-0.7-1.8-2-1.8h-1.7v6h1.1v-2.4h0.1l1.6,2.4H42l-1.8-2.5C41,24.3,41.5,23.7,41.5,22.8z M39.2,23.8h-0.3v-1.8h0.3c0.7,0,1.1,0.3,1.1,0.9C40.3,23.4,40,23.8,39.2,23.8z M7.7,21H6v6h1.6c2.5,0,3.1-2.1,3.1-3C10.8,22.2,9.5,21,7.7,21z M7.4,26H7.1v-4h0.4c1.5,0,2.1,1,2.1,2C9.6,24.4,9.5,26,7.4,26z M15.3,23.3c-0.7-0.3-0.9-0.4-0.9-0.7c0-0.4,0.4-0.6,0.8-0.6c0.3,0,0.6,0.1,0.9,0.5l0.6-0.8C16.2,21.2,15.7,21,15,21c-1,0-1.8,0.7-1.8,1.7c0,0.8,0.4,1.2,1.4,1.6c0.6,0.2,1.1,0.4,1.1,0.9c0,0.5-0.4,0.8-0.9,0.8c-0.5,0-1-0.3-1.2-0.8l-0.7,0.7c0.5,0.8,1.1,1.1,2,1.1c1.2,0,2-0.8,2-1.9C16.9,24.2,16.5,23.8,15.3,23.3z"></path>
                        </svg>
                      </div>

                      {/* +2 */}
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-muted-foreground">
                        +2
                      </div>

                      {/* HOVER POPOVER (Square supported) */}
                      <div
                        className="
                        absolute
                        right-0
                        top-8
                        hidden
                        group-hover:flex
                        gap-3
                        p-3
                        bg-muted
                        rounded-lg
                        shadow-lg
                        z-20
                      "
                      >
                        {/* JCB */}
                        <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                          <svg width="780px" height="780px" viewBox="0 -140 780 780" enableBackground="new 0 0 780 500" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="m632.24 361.27c0 41.615-33.729 75.36-75.357 75.36h-409.13v-297.88c0-41.626 33.73-75.371 75.364-75.371h409.12l-1e-3 297.89z" fill="#fff" /><linearGradient id="c" x1="908.72" x2="909.72" y1="313.21" y2="313.21" gradientTransform="matrix(132.87 0 0 323.02 -1.2027e5 -1.0093e5)" gradientUnits="userSpaceOnUse"><stop stopColor="#007B40" offset="0" /><stop stopColor="#55B330" offset="1" /></linearGradient><path d="m498.86 256.54c11.686 0.254 23.438-0.516 35.077 0.4 11.787 2.199 14.628 20.043 4.156 25.887-7.145 3.85-15.633 1.434-23.379 2.113h-15.854v-28.4zm41.834-32.145c2.596 9.164-6.238 17.392-15.064 16.13h-26.77c0.188-8.642-0.367-18.022 0.272-26.209 10.724 0.302 21.547-0.616 32.209 0.48 4.581 1.151 8.415 4.917 9.353 9.599zm64.425-135.9c0.498 17.501 0.072 35.927 0.215 53.783-0.033 72.596 0.07 145.19-0.057 217.79-0.47 27.207-24.582 50.848-51.601 51.391-27.045 0.11-54.094 0.017-81.143 0.047v-109.75c29.471-0.152 58.957 0.309 88.416-0.23 13.666-0.858 28.635-9.875 29.271-24.914 1.609-15.104-12.631-25.551-26.151-27.201-5.197-0.135-5.045-1.515 0-2.117 12.895-2.787 23.021-16.133 19.227-29.499-3.233-14.058-18.771-19.499-31.695-19.472-26.352-0.179-52.709-0.025-79.062-0.077 0.17-20.489-0.355-41 0.283-61.474 2.088-26.716 26.807-48.748 53.446-48.27 26.287-4e-3 52.57-4e-3 78.851-5e-3z" fill="url(#c)" /><linearGradient id="b" x1="908.73" x2="909.73" y1="313.21" y2="313.21" gradientTransform="matrix(133.43 0 0 323.02 -1.2108e5 -1.0092e5)" gradientUnits="userSpaceOnUse"><stop stopColor="#1D2970" offset="0" /><stop stopColor="#006DBA" offset="1" /></linearGradient><path d="m174.74 139.54c0.673-27.164 24.888-50.611 51.872-51.008 26.945-0.083 53.894-0.012 80.839-0.036-0.074 90.885 0.146 181.78-0.111 272.66-1.038 26.834-24.989 49.834-51.679 50.309-26.996 0.098-53.995 0.014-80.992 0.041v-113.45c26.223 6.195 53.722 8.832 80.474 4.723 15.991-2.573 33.487-10.426 38.901-27.016 3.984-14.191 1.741-29.126 2.334-43.691v-33.825h-46.297c-0.208 22.371 0.426 44.781-0.335 67.125-1.248 13.734-14.849 22.46-27.802 21.994-16.064 0.17-47.897-11.642-47.897-11.642-0.08-41.914 0.466-94.405 0.693-136.18z" fill="url(#b)" /><linearGradient id="a" x1="908.72" x2="909.72" y1="313.21" y2="313.21" gradientTransform="matrix(132.96 0 0 323.03 -1.205e5 -1.0093e5)" gradientUnits="userSpaceOnUse"><stop stopColor="#6E2B2F" offset="0" /><stop stopColor="#E30138" offset="1" /></linearGradient><path d="m324.72 211.89c-2.437 0.517-0.49-8.301-1.113-11.646 0.166-21.15-0.347-42.323 0.283-63.458 2.082-26.829 26.991-48.916 53.738-48.288h78.768c-0.074 90.885 0.145 181.78-0.111 272.66-1.039 26.834-24.992 49.833-51.683 50.309-26.997 0.102-53.997 0.016-80.996 0.042v-124.3c18.439 15.129 43.5 17.484 66.472 17.525 17.318-6e-3 34.535-2.676 51.353-6.67v-22.772c-18.953 9.446-41.233 15.446-62.243 10.019-14.656-3.648-25.295-17.812-25.058-32.937-1.698-15.729 7.522-32.335 22.979-37.011 19.191-6.008 40.107-1.413 58.096 6.398 3.854 2.018 7.766 4.521 6.225-1.921v-17.899c-30.086-7.158-62.104-9.792-92.33-2.005-8.749 2.468-17.273 6.211-24.38 11.956z" fill="url(#a)" /></svg>

                        </div>


                        {/* UNIONPAY (via Discover) */}
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg"
                          alt="UnionPay"
                          className="h-5"
                        />
                      </div>
                    </div>

                  </div>
                  {paymentMethod === "card" && (
                    <div className="p-4 border-x-2 border-b-2 border-accent rounded-b-lg space-y-3">
                      <Input placeholder="Card number" className="h-12" />
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="Expiration date (MM / YY)" className="h-12 col-span-2" />
                        <div className="relative">
                          <Input placeholder="Security code" className="h-12" />
                          <Info className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <Input placeholder="Name on card" className="h-12" />
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-foreground rounded" defaultChecked />
                        <span className="text-sm text-muted-foreground">Use shipping address as billing address</span>
                      </label>
                    </div>
                  )}
                </label>

                <label
                  className={`
                  flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
                  ${paymentMethod === "paypal"
                      ? "border-2 border-accent bg-accent/10"
                      : "border border-border hover:border-accent/50"
                    }
                `}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    className="accent-foreground"
                  />
                  <span className="font-medium">PayPal</span>
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxcHgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAxMDEgMzIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHhtbG5zPSJodHRwOiYjeDJGOyYjeDJGO3d3dy53My5vcmcmI3gyRjsyMDAwJiN4MkY7c3ZnIj48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDEyLjIzNyAyLjggTCA0LjQzNyAyLjggQyAzLjkzNyAyLjggMy40MzcgMy4yIDMuMzM3IDMuNyBMIDAuMjM3IDIzLjcgQyAwLjEzNyAyNC4xIDAuNDM3IDI0LjQgMC44MzcgMjQuNCBMIDQuNTM3IDI0LjQgQyA1LjAzNyAyNC40IDUuNTM3IDI0IDUuNjM3IDIzLjUgTCA2LjQzNyAxOC4xIEMgNi41MzcgMTcuNiA2LjkzNyAxNy4yIDcuNTM3IDE3LjIgTCAxMC4wMzcgMTcuMiBDIDE1LjEzNyAxNy4yIDE4LjEzNyAxNC43IDE4LjkzNyA5LjggQyAxOS4yMzcgNy43IDE4LjkzNyA2IDE3LjkzNyA0LjggQyAxNi44MzcgMy41IDE0LjgzNyAyLjggMTIuMjM3IDIuOCBaIE0gMTMuMTM3IDEwLjEgQyAxMi43MzcgMTIuOSAxMC41MzcgMTIuOSA4LjUzNyAxMi45IEwgNy4zMzcgMTIuOSBMIDguMTM3IDcuNyBDIDguMTM3IDcuNCA4LjQzNyA3LjIgOC43MzcgNy4yIEwgOS4yMzcgNy4yIEMgMTAuNjM3IDcuMiAxMS45MzcgNy4yIDEyLjYzNyA4IEMgMTMuMTM3IDguNCAxMy4zMzcgOS4xIDEzLjEzNyAxMC4xIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDM1LjQzNyAxMCBMIDMxLjczNyAxMCBDIDMxLjQzNyAxMCAzMS4xMzcgMTAuMiAzMS4xMzcgMTAuNSBMIDMwLjkzNyAxMS41IEwgMzAuNjM3IDExLjEgQyAyOS44MzcgOS45IDI4LjAzNyA5LjUgMjYuMjM3IDkuNSBDIDIyLjEzNyA5LjUgMTguNjM3IDEyLjYgMTcuOTM3IDE3IEMgMTcuNTM3IDE5LjIgMTguMDM3IDIxLjMgMTkuMzM3IDIyLjcgQyAyMC40MzcgMjQgMjIuMTM3IDI0LjYgMjQuMDM3IDI0LjYgQyAyNy4zMzcgMjQuNiAyOS4yMzcgMjIuNSAyOS4yMzcgMjIuNSBMIDI5LjAzNyAyMy41IEMgMjguOTM3IDIzLjkgMjkuMjM3IDI0LjMgMjkuNjM3IDI0LjMgTCAzMy4wMzcgMjQuMyBDIDMzLjUzNyAyNC4zIDM0LjAzNyAyMy45IDM0LjEzNyAyMy40IEwgMzYuMTM3IDEwLjYgQyAzNi4yMzcgMTAuNCAzNS44MzcgMTAgMzUuNDM3IDEwIFogTSAzMC4zMzcgMTcuMiBDIDI5LjkzNyAxOS4zIDI4LjMzNyAyMC44IDI2LjEzNyAyMC44IEMgMjUuMDM3IDIwLjggMjQuMjM3IDIwLjUgMjMuNjM3IDE5LjggQyAyMy4wMzcgMTkuMSAyMi44MzcgMTguMiAyMy4wMzcgMTcuMiBDIDIzLjMzNyAxNS4xIDI1LjEzNyAxMy42IDI3LjIzNyAxMy42IEMgMjguMzM3IDEzLjYgMjkuMTM3IDE0IDI5LjczNyAxNC42IEMgMzAuMjM3IDE1LjMgMzAuNDM3IDE2LjIgMzAuMzM3IDE3LjIgWiI+PC9wYXRoPjxwYXRoIGZpbGw9IiMwMDMwODciIGQ9Ik0gNTUuMzM3IDEwIEwgNTEuNjM3IDEwIEMgNTEuMjM3IDEwIDUwLjkzNyAxMC4yIDUwLjczNyAxMC41IEwgNDUuNTM3IDE4LjEgTCA0My4zMzcgMTAuOCBDIDQzLjIzNyAxMC4zIDQyLjczNyAxMCA0Mi4zMzcgMTAgTCAzOC42MzcgMTAgQyAzOC4yMzcgMTAgMzcuODM3IDEwLjQgMzguMDM3IDEwLjkgTCA0Mi4xMzcgMjMgTCAzOC4yMzcgMjguNCBDIDM3LjkzNyAyOC44IDM4LjIzNyAyOS40IDM4LjczNyAyOS40IEwgNDIuNDM3IDI5LjQgQyA0Mi44MzcgMjkuNCA0My4xMzcgMjkuMiA0My4zMzcgMjguOSBMIDU1LjgzNyAxMC45IEMgNTYuMTM3IDEwLjYgNTUuODM3IDEwIDU1LjMzNyAxMCBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA2Ny43MzcgMi44IEwgNTkuOTM3IDIuOCBDIDU5LjQzNyAyLjggNTguOTM3IDMuMiA1OC44MzcgMy43IEwgNTUuNzM3IDIzLjYgQyA1NS42MzcgMjQgNTUuOTM3IDI0LjMgNTYuMzM3IDI0LjMgTCA2MC4zMzcgMjQuMyBDIDYwLjczNyAyNC4zIDYxLjAzNyAyNCA2MS4wMzcgMjMuNyBMIDYxLjkzNyAxOCBDIDYyLjAzNyAxNy41IDYyLjQzNyAxNy4xIDYzLjAzNyAxNy4xIEwgNjUuNTM3IDE3LjEgQyA3MC42MzcgMTcuMSA3My42MzcgMTQuNiA3NC40MzcgOS43IEMgNzQuNzM3IDcuNiA3NC40MzcgNS45IDczLjQzNyA0LjcgQyA3Mi4yMzcgMy41IDcwLjMzNyAyLjggNjcuNzM3IDIuOCBaIE0gNjguNjM3IDEwLjEgQyA2OC4yMzcgMTIuOSA2Ni4wMzcgMTIuOSA2NC4wMzcgMTIuOSBMIDYyLjgzNyAxMi45IEwgNjMuNjM3IDcuNyBDIDYzLjYzNyA3LjQgNjMuOTM3IDcuMiA2NC4yMzcgNy4yIEwgNjQuNzM3IDcuMiBDIDY2LjEzNyA3LjIgNjcuNDM3IDcuMiA2OC4xMzcgOCBDIDY4LjYzNyA4LjQgNjguNzM3IDkuMSA2OC42MzcgMTAuMSBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA5MC45MzcgMTAgTCA4Ny4yMzcgMTAgQyA4Ni45MzcgMTAgODYuNjM3IDEwLjIgODYuNjM3IDEwLjUgTCA4Ni40MzcgMTEuNSBMIDg2LjEzNyAxMS4xIEMgODUuMzM3IDkuOSA4My41MzcgOS41IDgxLjczNyA5LjUgQyA3Ny42MzcgOS41IDc0LjEzNyAxMi42IDczLjQzNyAxNyBDIDczLjAzNyAxOS4yIDczLjUzNyAyMS4zIDc0LjgzNyAyMi43IEMgNzUuOTM3IDI0IDc3LjYzNyAyNC42IDc5LjUzNyAyNC42IEMgODIuODM3IDI0LjYgODQuNzM3IDIyLjUgODQuNzM3IDIyLjUgTCA4NC41MzcgMjMuNSBDIDg0LjQzNyAyMy45IDg0LjczNyAyNC4zIDg1LjEzNyAyNC4zIEwgODguNTM3IDI0LjMgQyA4OS4wMzcgMjQuMyA4OS41MzcgMjMuOSA4OS42MzcgMjMuNCBMIDkxLjYzNyAxMC42IEMgOTEuNjM3IDEwLjQgOTEuMzM3IDEwIDkwLjkzNyAxMCBaIE0gODUuNzM3IDE3LjIgQyA4NS4zMzcgMTkuMyA4My43MzcgMjAuOCA4MS41MzcgMjAuOCBDIDgwLjQzNyAyMC44IDc5LjYzNyAyMC41IDc5LjAzNyAxOS44IEMgNzguNDM3IDE5LjEgNzguMjM3IDE4LjIgNzguNDM3IDE3LjIgQyA3OC43MzcgMTUuMSA4MC41MzcgMTMuNiA4Mi42MzcgMTMuNiBDIDgzLjczNyAxMy42IDg0LjUzNyAxNCA4NS4xMzcgMTQuNiBDIDg1LjczNyAxNS4zIDg1LjkzNyAxNi4yIDg1LjczNyAxNy4yIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDA5Y2RlIiBkPSJNIDk1LjMzNyAzLjMgTCA5Mi4xMzcgMjMuNiBDIDkyLjAzNyAyNCA5Mi4zMzcgMjQuMyA5Mi43MzcgMjQuMyBMIDk1LjkzNyAyNC4zIEMgOTYuNDM3IDI0LjMgOTYuOTM3IDIzLjkgOTcuMDM3IDIzLjQgTCAxMDAuMjM3IDMuNSBDIDEwMC4zMzcgMy4xIDEwMC4wMzcgMi44IDk5LjYzNyAyLjggTCA5Ni4wMzcgMi44IEMgOTUuNjM3IDIuOCA5NS40MzcgMyA5NS4zMzcgMy4zIFoiPjwvcGF0aD48L3N2Zz4" className="h-5 w-auto ml-auto" />
                </label>

                <label
                  className={`
                  flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
                  ${paymentMethod === "sezzle"
                      ? "border-2 border-accent bg-accent/10"
                      : "border border-border hover:border-accent/50"
                    }
                `}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "sezzle"}
                    onChange={() => setPaymentMethod("sezzle")}
                    className="accent-foreground"
                  />
                  <span className="font-medium">Buy Now, Pay Later with Sezzle</span>
                  <img
                    src="https://media.sezzle.com/branding/2.0/Sezzle_Logo_FullColor.svg"
                    alt="Sezzle"
                    className="h-5 ml-auto"
                  />
                </label>

                <label className={`
                  flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
                  ${paymentMethod === "credit"
                    ? "border-2 border-accent bg-accent/10"
                    : "border border-border hover:border-accent/50"
                  }
                `}>
                  <input
                    className="accent-foreground"
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "credit"}
                    onChange={() => setPaymentMethod("credit")}
                  />
                  <span className="font-medium">Store Credit</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-background border border-border rounded-lg p-6 space-y-4">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {/* Image */}
                    <div className="relative">
                      <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.color} / {item.size}
                      </p>

                      {/* <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-muted"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted"
                        >
                          +
                        </button>
                      </div> */}
                    </div>

                    {/* Price + Trash (RIGHT SIDE) */}
                    <div className="ml-auto flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold">
                        ${item.price.toFixed(2)}
                      </span>
                      {/* 
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Discount Code */}
              <div className="flex gap-2">
                <Input placeholder="Discount code or gift card" className="h-10" />
                <Button variant="outline" size="sm" className="bg-transparent h-10">
                  Apply
                </Button>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal · {cartItems.length} items</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Shipping</span>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="font-medium">
                    ${shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated taxes</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-normal mr-2">USD</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  //onClick={handleStripeCheckout}
                  className="w-full bg-[#C8A882] text-white hover:bg-[#B89872] h-10 text-base font-semibold cursor-pointer mt-2"
                >
                  Pay now
                </Button>
                <Button variant="default" className="w-full h-10 text-base cursor-pointer" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
