"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await getCurrentUser()
      if (error || !user) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Your account settings will appear here</p>
        </div>
      </div>
    </div>
  )
} 