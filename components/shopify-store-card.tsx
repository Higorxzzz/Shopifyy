"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Heart } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Store {
  id: number
  name: string
  domain: string
  revenue: string
  monthlyVisitors: string
  conversionRate: string
  topProducts: string[]
  adSpend: string
  roas: string
  category: string
  country: string
  founded: string
  employees: string
  image: string
  status: string
  growth: string
  products?: string
  trafficRank?: string
}

interface ShopifyStoreCardProps {
  store: Store
}

function formatPortugueseNumber(num: string): string {
  return num.replace(/,/g, ".")
}

function useStoreStatus(domain: string) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Use a CORS proxy or your own API endpoint to check status
        const response = await fetch(`/api/check-store-status?domain=${encodeURIComponent(domain)}`)
        const data = await response.json()

        if (data.status >= 200 && data.status < 300) {
          setStatus("online")
        } else {
          setStatus("offline")
        }
      } catch (error) {
        console.log("[v0] Store status check failed:", error)
        setStatus("offline")
      }
    }

    checkStatus()
  }, [domain])

  return status
}

export function ShopifyStoreCard({ store }: ShopifyStoreCardProps) {
  const screenshotUrl = `https://s.wordpress.com/mshots/v1/https://${store.domain}?w=600`
  const storeStatus = useStoreStatus(store.domain)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteStores") || "[]")
    setIsFavorite(favorites.some((fav: Store) => fav.id === store.id))
  }, [store.id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteStores") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: Store) => fav.id !== store.id)
      localStorage.setItem("favoriteStores", JSON.stringify(updatedFavorites))
      setIsFavorite(false)
    } else {
      const updatedFavorites = [...favorites, store]
      localStorage.setItem("favoriteStores", JSON.stringify(updatedFavorites))
      setIsFavorite(true)
    }

    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent("favoritesUpdated"))
  }

  return (
    <Card className="liquid-glass border-white/20 hover:border-[#39ff14]/30 transition-all duration-300 group">
      <CardContent className="p-6 space-y-4">
        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-800/50 shadow-lg">
          <Image
            src={screenshotUrl || "/placeholder.svg"}
            alt={`Preview real do site ${store.domain}`}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `/placeholder.svg?height=128&width=300&query=website+preview`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-[#39ff14]/90 text-black text-xs font-semibold">
              {store.country}
            </Badge>
          </div>
          <div className="absolute top-2 left-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`h-8 w-8 p-0 rounded-full ${
                isFavorite ? "bg-red-500/90 hover:bg-red-600/90 text-white" : "bg-black/50 hover:bg-black/70 text-white"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://${store.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#39ff14] transition-colors duration-200 font-medium text-base flex items-center gap-1"
          >
            {store.domain}
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="space-y-1">
            <p className="text-[#39ff14] text-2xl font-bold">{store.revenue}</p>
          </div>

          <div className="space-y-2">
            {/* Line 1: Products */}
            <div className="text-sm">
              <span className="text-gray-300">
                Produtos:{" "}
                <span className="text-white font-medium">{formatPortugueseNumber(store.products || "0")}</span>
              </span>
            </div>

            {/* Line 2: Traffic Rank */}
            <div className="text-sm">
              <span className="text-gray-300">
                Rank de tráfego:{" "}
                <span className="text-white font-medium">{formatPortugueseNumber(store.trafficRank || "0")}</span>
              </span>
            </div>

            <div className="text-xs pt-1">
              <span className="text-gray-400">
                Status: {storeStatus === "checking" && <span className="text-gray-400">● Verificando...</span>}
                {storeStatus === "online" && <span className="text-[#39ff14]">● Online</span>}
                {storeStatus === "offline" && <span className="text-[#ff1744]">● Offline</span>}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
