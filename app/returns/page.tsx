import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Returns & Exchanges</h1>
          <p className="text-muted-foreground">
            We want you to love every piece you purchase. If something isn't quite right, we're here to help.
          </p>
        </div>

        <div className="space-y-8">
          {/* Return Policy */}
          <div className="bg-secondary rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Return Policy</h2>
            <ul className="space-y-3">
              {[
                "30-day return window from the date of purchase",
                "Items must be unworn, unwashed, and in original condition with tags attached",
                "Original packaging and receipt required for full refund",
                "Free return shipping for defective items",
                "Refunds processed within 5-7 business days",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exchange Policy */}
          <div className="bg-secondary rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Exchanges</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Want to exchange an item for a different size or color? No problem! Exchanges are free for items within
              the return window. Simply initiate an exchange through your account or contact our customer service team.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Start an Exchange</Button>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Non-Returnable Items
            </h3>
            <ul className="list-disc list-inside text-red-800 space-y-2">
              <li>Items that show signs of wear or damage</li>
              <li>Items that have been washed or altered</li>
              <li>Items purchased on final sale or clearance</li>
              <li>Gift cards</li>
              <li>Custom or personalized orders</li>
            </ul>
          </div>

          {/* How to Return */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">How to Return an Item</h2>

            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Initiate Return",
                  description:
                    "Go to your account and select the item you wish to return. Follow the prompts to generate a prepaid return label.",
                },
                {
                  step: "2",
                  title: "Package Your Item",
                  description:
                    "Securely package your item in its original packaging with all tags attached. Include your order number in the box.",
                },
                {
                  step: "3",
                  title: "Ship It Back",
                  description:
                    "Use the prepaid return label to ship your package back to us. You can drop it off at any carrier location.",
                },
                {
                  step: "4",
                  title: "Get Your Refund",
                  description:
                    "Once we receive and inspect your return, we'll process your refund within 5-7 business days.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-semibold">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about our returns policy or need assistance with a return, please don't hesitate
              to contact us.
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:help@honeyandoak.com">Email Us</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
