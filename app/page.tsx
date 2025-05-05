import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, DollarSign, Lock, RefreshCw, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-600">North</span>Send
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 -z-10" />
          <div className="container flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Send & Receive Money Across US and Canada — Instantly
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
              No PayPal. No waiting. Just fast, borderless cash flow.
            </p>
            <Button size="lg" className="mt-10 px-8 py-6 text-lg" asChild>
              <Link href="/sign-up">
                Get Your Free Cashtag
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="relative h-[500px] w-[250px] overflow-hidden rounded-[40px] border-8 border-gray-800 shadow-xl">
                <Image
                  src="/placeholder.svg?height=500&width=250"
                  alt="NorthSend mobile app"
                  width={250}
                  height={500}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative h-[400px] w-[200px] overflow-hidden rounded-[32px] border-8 border-gray-800 shadow-xl md:mt-24">
                <Image
                  src="/placeholder.svg?height=400&width=200"
                  alt="NorthSend mobile app"
                  width={200}
                  height={400}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Why Choose NorthSend</h2>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">US Bank Account</h3>
                <p className="mt-2 text-center text-gray-600">
                  Get your own US bank account to receive USD from anyone in the United States.
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Real-Time Conversion</h3>
                <p className="mt-2 text-center text-gray-600">
                  Convert to CAD at real-time FX rates with no hidden fees or markups.
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Spend Anywhere</h3>
                <p className="mt-2 text-center text-gray-600">
                  Spend via virtual card or withdraw directly to your Canadian bank account.
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Secure & Compliant</h3>
                <p className="mt-2 text-center text-gray-600">
                  Bank-level security with full encryption and regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Sign Up</h3>
                <p className="mt-2 text-center text-gray-600">
                  Create an account and get your free cashtag in minutes.
                </p>
                <div className="absolute right-0 top-6 hidden h-0.5 w-full bg-blue-200 lg:block lg:w-1/2" />
              </div>
              <div className="relative flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Share Your Cashtag</h3>
                <p className="mt-2 text-center text-gray-600">
                  Share it with anyone in the US who needs to send you money.
                </p>
                <div className="absolute left-0 right-0 top-6 hidden h-0.5 w-full bg-blue-200 lg:block" />
              </div>
              <div className="relative flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Receive USD</h3>
                <p className="mt-2 text-center text-gray-600">
                  Get USD straight into your NorthSend account instantly.
                </p>
                <div className="absolute left-0 top-6 hidden h-0.5 w-1/2 bg-blue-200 lg:block" />
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <span className="text-lg font-bold">4</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Convert & Spend</h3>
                <p className="mt-2 text-center text-gray-600">Convert to CAD at great rates and spend immediately.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt="User avatar"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah T.</h3>
                    <p className="text-sm text-gray-600">Freelance Designer</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "I needed to receive payment from a US client—got the money through NorthSend and paid my rent the
                  same day!"
                </p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt="User avatar"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Michael R.</h3>
                    <p className="text-sm text-gray-600">Tech Consultant</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "My US clients can now pay me through Venmo, and I get the money instantly in my NorthSend account.
                  Game changer!"
                </p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt="User avatar"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Jessica L.</h3>
                    <p className="text-sm text-gray-600">Small Business Owner</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "The exchange rates are better than my bank, and I love being able to use the virtual card for online
                  purchases."
                </p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Simplify Cross-Border Payments?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Join thousands of Canadians who are already enjoying seamless US-Canada money transfers.
            </p>
            <Button size="lg" variant="secondary" className="mt-10 px-8 py-6 text-lg" asChild>
              <Link href="/sign-up">
                Get Your Free Cashtag
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-blue-600">North</span>Send
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Making cross-border payments between the US and Canada simple, fast, and affordable.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} NorthSend. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
