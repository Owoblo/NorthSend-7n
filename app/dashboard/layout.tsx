'use client'

import { DashboardNav } from '@/components/dashboard-nav'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden border-r bg-gray-100/40 lg:block lg:w-64">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">NorthSend</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <DashboardNav />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
} 