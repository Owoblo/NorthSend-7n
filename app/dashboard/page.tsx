"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, CreditCard, DollarSign, Home, LogOut, Menu, RefreshCw, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // This is to prevent hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = () => {
    // This would be replaced with your actual logout logic
    router.push("/")
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">North</span>Send
          </span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between py-4">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-blue-600">North</span>Send
                </span>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
              <div className="flex flex-col gap-1 py-4">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/dashboard/cards">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Cards
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/dashboard/transactions">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Transactions
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Link>
                </Button>
              </div>
              <div className="mt-auto border-t py-4">
                <Button variant="ghost" className="justify-start w-full text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-white fixed">
          <div className="flex h-16 items-center border-b px-6">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-600">North</span>Send
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/cards">
                <CreditCard className="mr-2 h-5 w-5" />
                Cards
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/transactions">
                <RefreshCw className="mr-2 h-5 w-5" />
                Transactions
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
            </Button>
          </div>
          <div className="mt-auto border-t p-4">
            <Button variant="ghost" className="justify-start w-full text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          {/* Desktop Header */}
          <header className="hidden md:flex h-16 items-center justify-between border-b bg-white px-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="container p-4 md:p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight md:hidden">Dashboard</h2>
              <p className="text-gray-600">Welcome back, John!</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Your Cashtag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">$johndoe</div>
                    <Button variant="ghost" size="sm">
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Share this with anyone in the US to receive money</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">USD Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="mr-1 h-5 w-5 text-gray-500" />
                    <div className="text-2xl font-bold">1,250.00</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Available to convert or spend</p>
                    <Button size="sm">Add Funds</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">CAD Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="mr-1 h-5 w-5 text-gray-500" />
                    <div className="text-2xl font-bold">3,425.75</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Available to withdraw or spend</p>
                    <Button size="sm">Withdraw</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <RefreshCw className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">USD to CAD Conversion</p>
                          <p className="text-sm text-gray-500">May 3, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$500.00 → C$675.25</p>
                        <p className="text-sm text-gray-500">Rate: 1.3505</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Received from @sarahsmith</p>
                          <p className="text-sm text-gray-500">May 2, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$750.00</p>
                        <p className="text-sm text-gray-500">Via Venmo</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Virtual Card Payment</p>
                          <p className="text-sm text-gray-500">May 1, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-C$89.99</p>
                        <p className="text-sm text-gray-500">Amazon.ca</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">Get Started</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Share Your Cashtag</CardTitle>
                    <CardDescription>Let US friends and clients send you money instantly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Copy Cashtag</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Set Up Your Profile</CardTitle>
                    <CardDescription>Complete your profile to unlock all features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">Complete Profile</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
