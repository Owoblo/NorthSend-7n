'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Wallet,
  ArrowLeftRight,
  Download,
  History,
  User,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Wallet
  },
  {
    title: 'Receive USD',
    href: '/dashboard/receive',
    icon: Download
  },
  {
    title: 'Convert',
    href: '/dashboard/convert',
    icon: ArrowLeftRight
  },
  {
    title: 'Withdraw',
    href: '/dashboard/withdraw',
    icon: Download
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    icon: History
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
          >
            <span
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent' : 'transparent'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
      <Button
        variant="ghost"
        className="justify-start"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </nav>
  )
} 