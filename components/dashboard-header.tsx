"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout, getUser } from "@/lib/auth"
import { useEffect, useState } from "react"
import Link from "next/link"

export function DashboardHeader() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/paises", label: "Países" },
    { href: "/produtos", label: "Produtos" },
    { href: "/downloads", label: "Downloads" },
    { href: "/biblioteca-de-anuncios", label: "Biblioteca de anúncios" },
    { href: "/rateio", label: "Rateio" },
  ]

  return (
    <header className="liquid-glass-header border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">Shopify Mining</h2>
        </div>

        <nav className="hidden lg:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-white hover:text-[#9ae600] transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:text-[#9ae600]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                  <AvatarFallback className="bg-[#9ae600] text-black">
                    {user?.name?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 border-white/20" align="end" forceMount>
              {user && <div className="px-2 py-1.5 text-sm text-gray-300 border-b border-white/10">{user.email}</div>}
              <DropdownMenuItem className="text-white hover:bg-white/10">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 px-4 text-white hover:text-[#9ae600] hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
