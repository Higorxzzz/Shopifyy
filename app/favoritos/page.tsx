"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { ShopifyStoreCard } from "@/components/shopify-store-card"
import Plasma from "@/components/plasma"
import { useState, useEffect } from "react"

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

export default function FavoritosPage() {
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([])

  useEffect(() => {
    const loadFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem("favoriteStores") || "[]")
      setFavoriteStores(favorites)
    }

    loadFavorites()

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites()
    }

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate)
    return () => window.removeEventListener("favoritesUpdated", handleFavoritesUpdate)
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-0 bg-black">
        <Plasma color="#9ae600" speed={0.8} direction="forward" scale={1.5} opacity={0.4} mouseInteractive={true} />
      </div>
      <div className="relative z-10 min-h-screen text-white">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Favoritos</h1>
            <p className="text-gray-300">Suas lojas Shopify favoritas em um só lugar</p>
          </div>

          {favoriteStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {favoriteStores.map((store) => (
                <ShopifyStoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma loja favorita ainda</h3>
              <p className="text-gray-400">Clique no coração nas lojas para adicioná-las aos seus favoritos</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
