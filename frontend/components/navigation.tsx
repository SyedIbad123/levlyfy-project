"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { href: "/", label: "CAREER" },
    { href: "/leaderboard", label: "LEADERBOARD" },
    { href: "/training", label: "TRAINING CENTER" },
    { href: "/achievements", label: "ACHIEVEMENTS" },
    { href: "/news", label: "NEWS" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex justify-between items-center px-4 md:px-8 py-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
            ))}
          </div>
        </div>

        <Link href="/profile" className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors">
            <Image
              src="/placeholder.svg?height=48&width=48"
              width={48}
              height={48}
              alt="User profile"
              className="object-cover"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
        </Link>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 animate-fade-in">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 px-4 font-bold text-center rounded-md ${
                  isActive(item.href) ? "bg-navItem-default border-l-4 border-navItem-active" : "bg-navItem-default"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`nav-item ${active ? "active" : ""}`}>
      {label}
    </Link>
  )
}

