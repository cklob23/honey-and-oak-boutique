"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState<string | null>("50")
  const [customAmount, setCustomAmount] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [purchaserEmail, setPurchaserEmail] = useState("")
  const [step, setStep] = useState<"select" | "details" | "review">("select")

  const giftCardTypes = [
    { id: "25", amount: 25, description: "Perfect for a small gift" },
    { id: "50", amount: 50, description: "Most popular choice" },
    { id: "100", amount: 100, description: "Generous gift" },
    { id: "250", amount: 250, description: "Premium gift" },
  ]

  const handleSelectAmount = (id: string) => {
    setSelectedAmount(id)
    setCustomAmount("")
    setStep("details")
  }

  const handleCustomAmount = () => {
    if (customAmount && Number.parseFloat(customAmount) > 0) {
      setSelectedAmount("custom")
      setStep("details")
    }
  }

  const getAmount = () => {
    if (selectedAmount === "custom") return Number.parseFloat(customAmount)
    return Number.parseInt(selectedAmount || "0")
  }

  const handlePurchase = () => {
    // TODO: Call API to create gift card
    setStep("review")
  }

  if (step === "review") {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-6">
            <Gift className="w-16 h-16 text-accent mx-auto" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Gift Card Sent!</h1>
          <p className="text-muted-foreground mb-2">Your ${getAmount()} gift card has been purchased successfully.</p>
          <p className="text-muted-foreground mb-8">
            A confirmation email has been sent to <strong>{purchaserEmail}</strong>, and the gift card details have been
            sent to <strong>{recipientEmail}</strong>.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mr-4" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("select")
              setSelectedAmount(null)
              setRecipientEmail("")
              setMessage("")
              setPurchaserEmail("")
            }}
          >
            Buy Another Card
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
            Give the Gift of Style
          </h1>
          <p className="text-lg text-muted-foreground">
            Digital gift cards delivered instantly. Perfect for any occasion.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {step === "select" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">Select Gift Card Amount</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {giftCardTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectAmount(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedAmount === type.id ? "border-accent bg-accent/10" : "border-border hover:border-accent"
                      }`}
                    >
                      <div className="text-2xl font-bold text-foreground">${type.amount}</div>
                      <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-border pt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Or Enter Custom Amount</h3>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-7"
                        min="1"
                      />
                    </div>
                    <Button
                      onClick={handleCustomAmount}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Select
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Minimum $25, maximum $5,000</p>
                </div>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-8">
              <Button variant="ghost" onClick={() => setStep("select")} className="mb-4">
                ← Back
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>Gift Card Details</CardTitle>
                  <CardDescription>${getAmount()} Digital Gift Card</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">Email to Recipient</TabsTrigger>
                      <TabsTrigger value="print">Print It</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground block mb-2">
                          Recipient Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-foreground block mb-2">Your Email Address</label>
                        <Input
                          type="email"
                          placeholder="your@example.com"
                          value={purchaserEmail}
                          onChange={(e) => setPurchaserEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Personal Message (Optional)
                        </label>
                        <textarea
                          placeholder="Add a personal message to your gift..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-2">{message.length}/200 characters</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="print" className="space-y-4">
                      <div className="bg-secondary rounded-lg p-6 border-2 border-dashed border-border">
                        <div className="text-center">
                          <Gift className="w-12 h-12 text-accent mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground mb-2">Gift Card</p>
                          <p className="text-4xl font-bold text-foreground mb-2">${getAmount()}</p>
                          <p className="text-xs text-muted-foreground">
                            Code: HC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You can print this design or customize it further before printing.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="bg-secondary rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Gift Card Amount</span>
                  <span className="text-2xl font-bold text-foreground">${getAmount()}</span>
                </div>
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-accent mb-3">1</div>
                <p className="text-muted">Select amount and personalize with a message</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-3">2</div>
                <p className="text-muted">Complete your purchase securely</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-3">3</div>
                <p className="text-muted">Gift card sent instantly via email</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
