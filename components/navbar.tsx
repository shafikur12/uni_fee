'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar({
  onLoginClick,
  onSignupClick,
}: {
  onLoginClick: () => void
  onSignupClick: () => void
}) {
  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              UniFee
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="text-sm"
            >
              Log In
            </Button>
            <Button
              onClick={onSignupClick}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
