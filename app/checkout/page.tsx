"use client"

import { useEffect, useState, useCallback } from "react"
import { PaymentForm, CreditCard, ApplePay, GooglePay } from "react-square-web-payments-sdk"
import apiClient from "@/lib/api-client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Package, Truck, Store, MapPin } from "lucide-react"

const STORE_LOCATION = {
  lat: 34.01129,
  lng: -85.06825,
}

export default function CheckoutPage() {
  const cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null

  const [cartItems, setCartItems] = useState<any[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState<"ship" | "pickup">("ship")
  const [guestEmail, setGuestEmail] = useState("")
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  })

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = deliveryMethod === "pickup" || subtotal >= 100 ? 0 : 10
  const tax = Number((subtotal * 0.0775).toFixed(2))
  const total = subtotal + shipping + tax

  const totalCents = Math.round(total * 100)

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const isShippingValid =
    deliveryMethod === "pickup" ||
    (shippingAddress.firstName &&
      shippingAddress.lastName &&
      shippingAddress.address &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zipCode)

  const pickupLocations = [
    {
      id: "honey-and-oak",
      name: "HONEY & OAK BOUTIQUE LLC",
      address: "220 Oakhill Drive, Rockmart GA",
      readyTime: "Usually ready in 3-5 business days",
      price: "FREE",
    },
  ]

  const getDistanceMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8 // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2

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

        const rawMiles = getDistanceMiles(latitude, longitude, STORE_LOCATION.lat, STORE_LOCATION.lng)

        const miles = rawMiles < 0.2 ? 0 : Number(rawMiles.toFixed(1))

        setDistanceMiles(miles)
        setShowLocationPrompt(false)
      },
      () => {
        alert("Unable to retrieve your location.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handlePaymentToken = useCallback(
    async (token: any, buyer: any) => {
      if (!cartId || !guestEmail) {
        setPaymentError("Please enter your email address")
        return
      }

      if (deliveryMethod === "ship" && !isShippingValid) {
        setPaymentError("Please complete all required shipping address fields")
        return
      }

      setSubmitting(true)
      setPaymentError(null)

      try {
        const response = await apiClient.post("/checkout/square", {
          cartId,
          sourceId: token.token,
          email: guestEmail,
          shipping,
          deliveryMethod,
          verificationToken: buyer?.token,
          shippingAddress: deliveryMethod === "ship" ? shippingAddress : null,
        })

        if (response.data.success) {
          window.location.href = `/checkout/complete?paymentId=${response.data.paymentId}`
        } else {
          setPaymentError(response.data.error || "Payment failed. Please try again.")
        }
      } catch (error: any) {
        console.error("Payment error:", error)
        setPaymentError(error.response?.data?.error || "Payment failed. Please try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [cartId, guestEmail, shipping, deliveryMethod, shippingAddress, isShippingValid],
  )

  useEffect(() => {
    if (!cartId) return
    apiClient.get(`/cart/${cartId}`).then((res) => {
      setCartItems(res.data.items || [])
    })
  }, [cartId])

  if (cartItems.length === 0 && cartId) {
    return <div className="min-h-screen grid place-items-center">Loading…</div>
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <PaymentForm
            applicationId={process.env.NEXT_PUBLIC_SQUARE_APP_ID!}
            locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!}
            cardTokenizeResponseReceived={handlePaymentToken}
            createPaymentRequest={() => ({
              countryCode: "US",
              currencyCode: "USD",
              total: {
                amount: total.toFixed(2),
                label: "Total",
              },
              lineItems: cartItems.map((item) => ({
                amount: item.price.toFixed(2),
                label: item.name,
              })),
            })}
            createVerificationDetails={() => ({
              amount: total.toFixed(2),
              currencyCode: "USD",
              intent: "CHARGE",
              billingContact: {
                email: guestEmail,
                ...(deliveryMethod === "ship" && {
                  givenName: shippingAddress.firstName,
                  familyName: shippingAddress.lastName,
                  phone: shippingAddress.phone,
                  addressLines: [shippingAddress.address, shippingAddress.apartment].filter(Boolean),
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  postalCode: shippingAddress.zipCode,
                  countryCode: "US",
                }),
              },
            })}
          >
            {/* Express Checkout - Apple Pay & Google Pay */}
            <div className="space-y-4">
              <h2 className="font-semibold">Express checkout</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <ApplePay />
                </div>
                <div className="flex-1">
                  <GooglePay buttonColor="black" buttonType="buy" />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* CONTACT */}
            <div>
              <h2 className="font-semibold mb-3">Contact</h2>
              <Input
                placeholder="Email address"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="h-12"
              />
              <label className="flex gap-2 mt-3 text-sm text-muted-foreground">
                <input type="checkbox" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} />
                Email me with news and offers
              </label>
            </div>

            {/* Delivery */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Delivery</h2>

              <div className="space-y-3 mb-4">
                {/* SHIP */}
                <label
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border
                  ${deliveryMethod === "ship" ? "border-accent bg-accent/5" : "border-border hover:border-accent"}
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
                    ${deliveryMethod === "pickup" ? "border-accent bg-accent/5" : "border-border hover:border-accent"}
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

              {deliveryMethod === "ship" && (
                <div className="space-y-4 mt-4 p-4 border border-border rounded-lg bg-muted/30">
                  <h3 className="text-sm font-semibold">Shipping address</h3>

                  <Select defaultValue="US">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Country/Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="First name"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange("firstName", e.target.value)}
                      className="h-12"
                    />
                    <Input
                      placeholder="Last name"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange("lastName", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <Input
                    placeholder="Company (optional)"
                    value={shippingAddress.company}
                    onChange={(e) => handleAddressChange("company", e.target.value)}
                    className="h-12"
                  />

                  <Input
                    placeholder="Address"
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange("address", e.target.value)}
                    className="h-12"
                  />

                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    value={shippingAddress.apartment}
                    onChange={(e) => handleAddressChange("apartment", e.target.value)}
                    className="h-12"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="h-12"
                    />
                    <Select
                      value={shippingAddress.state}
                      onValueChange={(value) => handleAddressChange("state", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AL">Alabama</SelectItem>
                        <SelectItem value="AK">Alaska</SelectItem>
                        <SelectItem value="AZ">Arizona</SelectItem>
                        <SelectItem value="AR">Arkansas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="DE">Delaware</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="HI">Hawaii</SelectItem>
                        <SelectItem value="ID">Idaho</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="IN">Indiana</SelectItem>
                        <SelectItem value="IA">Iowa</SelectItem>
                        <SelectItem value="KS">Kansas</SelectItem>
                        <SelectItem value="KY">Kentucky</SelectItem>
                        <SelectItem value="LA">Louisiana</SelectItem>
                        <SelectItem value="ME">Maine</SelectItem>
                        <SelectItem value="MD">Maryland</SelectItem>
                        <SelectItem value="MA">Massachusetts</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        <SelectItem value="MN">Minnesota</SelectItem>
                        <SelectItem value="MS">Mississippi</SelectItem>
                        <SelectItem value="MO">Missouri</SelectItem>
                        <SelectItem value="MT">Montana</SelectItem>
                        <SelectItem value="NE">Nebraska</SelectItem>
                        <SelectItem value="NV">Nevada</SelectItem>
                        <SelectItem value="NH">New Hampshire</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="NM">New Mexico</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="ND">North Dakota</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="OK">Oklahoma</SelectItem>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="RI">Rhode Island</SelectItem>
                        <SelectItem value="SC">South Carolina</SelectItem>
                        <SelectItem value="SD">South Dakota</SelectItem>
                        <SelectItem value="TN">Tennessee</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="UT">Utah</SelectItem>
                        <SelectItem value="VT">Vermont</SelectItem>
                        <SelectItem value="VA">Virginia</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="WV">West Virginia</SelectItem>
                        <SelectItem value="WI">Wisconsin</SelectItem>
                        <SelectItem value="WY">Wyoming</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="ZIP code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <Input
                    placeholder="Phone (optional)"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

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
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLocationPrompt(true)}
                        className="flex items-center gap-1 text-xs text-accent hover:bg-gray-100 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>US</span>
                      </button>
                    )}
                  </div>
                  {showLocationPrompt ? (
                    <button
                      type="button"
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
                    </p>
                  )}
                  {!showLocationPrompt &&
                    pickupLocations.map((location) => (
                      <div
                        key={location.id}
                        className="flex justify-between gap-4 p-4 border-2 border-accent bg-accent/5 rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {location.name}
                            {distanceMiles !== null && (
                              <span className="ml-1 text-muted-foreground font-normal">({distanceMiles} mi)</span>
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">{location.address}</p>
                          <p className="text-xs text-muted-foreground">{location.readyTime}</p>
                        </div>

                        <div className="text-sm font-semibold text-foreground">{location.price}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-3">Payment</h2>
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {paymentError}
                </div>
              )}
              <CreditCard
                buttonProps={{
                  css: {
                    backgroundColor: "#C8A882",
                    fontSize: "14px",
                    color: "#fff",
                    fontWeight: "600",
                    "&:hover": {
                      backgroundColor: "#B89872",
                    },
                  },
                }}
                style={{
                  input: {
                    fontSize: "14px",
                    fontFamily: "inherit",
                  },
                  "input::placeholder": {
                    color: "#9ca3af",
                  },
                }}
              >
                {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
              </CreditCard>
            </div>
          </PaymentForm>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="sticky top-24 border rounded-lg p-6 space-y-4 h-fit">
          {cartItems.map((item, i) => (
            <div key={i} className="flex gap-3">
              <img src={item?.image || "/placeholder.svg"} alt={item.name} className="w-16 h-20 rounded object-cover" />
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

          <Button variant="outline" asChild className="w-full h-10 bg-transparent">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
