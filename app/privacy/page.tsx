import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Honey & Oak Boutique ("we," "us," "our," or "Company") respects the privacy of our users ("user" or
              "you"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may collect information about you in a variety of ways. The information we may collect on the Site
              includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                Personal Data: Personally identifiable information, such as your name, shipping address, email address,
                and telephone number, and demographic information, such as your age, gender, hometown, and interests,
                that you voluntarily give to us when you register with the Site or purchase products.
              </li>
              <li>
                Payment Information: We may collect payment information, including credit card numbers, through
                third-party payment processors like Square.
              </li>
              <li>
                Device Information: Information about your device, including IP address, browser type, and operating
                system.
              </li>
              <li>
                Usage Information: Information about your interactions with our Site, including the products you view,
                add to your cart, or purchase.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Use of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized
              experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Process your transactions and send related information</li>
              <li>Email regarding your account or order</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site</li>
              <li>Generate a personal profile about you so that future visits to the Site will be personalized</li>
              <li>Increase the efficiency and operation of the Site</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Disclosure of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                By Law or to Protect Rights: If we believe the release of information about you is necessary to comply
                with the law, enforce our Site policies, or protect ours or others' rights, property, or safety.
              </li>
              <li>
                Third-Party Service Providers: We may share your information with parties that perform services for us,
                including payment processors, email providers, and analytics companies.
              </li>
              <li>
                Business Transfers: We may share or transfer your information in connection with a merger, sale of
                company assets, or other business transaction.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Security of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use administrative, technical, and physical security measures to protect your personal information.
              However, no method of transmission over the Internet or method of electronic storage is 100% secure.
              Therefore, while we strive to use commercially acceptable means to protect your personal information, we
              cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Honey & Oak Boutique
              <br />
              Email: privacy@honeyandoak.com
              <br />
              Phone: (555) 123-4567
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
