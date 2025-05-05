"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setEmailError("")

    if (!validateEmail()) {
      return
    }

    setIsLoading(true)

    try {
      // This would be replaced with your actual password reset logic
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful submission
      setIsSubmitted(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container max-w-md py-12">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          {!isSubmitted ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email address and we&apos;ll send you a link to reset your password
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError("")
                    }}
                    placeholder="john.doe@example.com"
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-4 text-gray-600">
                We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <p className="mt-2 text-gray-600">If you don&apos;t see it, please check your spam folder.</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
              >
                Try another email
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
