"use client"

import { ShopifyStoreCard } from "@/components/shopify-store-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback, useMemo } from "react"
import { ChevronDown } from "lucide-react"

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

interface ShopifyStoreGridProps {
  stores?: Store[]
  countryFilter?: string
}

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export function ShopifyStoreGrid({ stores: propStores, countryFilter }: ShopifyStoreGridProps) {
  const [rawStoreData, setRawStoreData] = useState<Store[]>([])
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [visibleStores, setVisibleStores] = useState<Store[]>([])
  const [displayedCount, setDisplayedCount] = useState(6)
  const [isLoading, setIsLoading] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadStores = () => {
      try {
        const savedContent = localStorage.getItem("skitbit-content")
        if (savedContent) {
          const parsedContent = JSON.parse(savedContent)
          if (parsedContent.stores && Array.isArray(parsedContent.stores)) {
            setRawStoreData(parsedContent.stores)
            setShuffledIndices(shuffleIndices(parsedContent.stores.length))
          }
        }
      } catch (error) {
        console.error("[v0] Error loading stores from localStorage:", error)
      }
    }

    loadStores()

    const handleStorageChange = () => {
      loadStores()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storesUpdated", handleStorageChange)
    }
  }, [])

  const filteredIndices = useMemo(() => {
    const allStores = propStores || rawStoreData
    const indices = propStores ? Array.from({ length: propStores.length }, (_, i) => i) : shuffledIndices

    if (!countryFilter || countryFilter === "all") {
      return indices
    }

    return indices.filter((index) => {
      const store = allStores[index]
      return store && store.country === countryFilter
    })
  }, [propStores, rawStoreData, shuffledIndices, countryFilter])

  useEffect(() => {
    const allStores = propStores || rawStoreData
    const indicesToShow = filteredIndices.slice(0, displayedCount)

    // Only create store objects for the ones we're actually displaying
    const storesToShow = indicesToShow.map((index) => allStores[index]).filter(Boolean)
    setVisibleStores(storesToShow)
  }, [propStores, rawStoreData, filteredIndices, displayedCount])

  const loadMoreStores = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)

    setTimeout(() => {
      const newCount = Math.min(displayedCount + 6, filteredIndices.length)
      setDisplayedCount(newCount)
      setIsLoading(false)
    }, 200)
  }, [filteredIndices.length, displayedCount, isLoading])

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return

      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      const timeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight

        if (scrollTop + windowHeight >= documentHeight - 100) {
          if (displayedCount < filteredIndices.length) {
            loadMoreStores()
          }
        }
      }, 50)

      setScrollTimeout(timeout)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [loadMoreStores, displayedCount, filteredIndices.length, isLoading, scrollTimeout])

  useEffect(() => {
    setDisplayedCount(6)
  }, [countryFilter])

  const uniqueCountries = useMemo(() => {
    const allStores = propStores || rawStoreData
    const countries = new Set<string>()

    // Sample only first 100 stores for country calculation to improve performance
    const sampleSize = Math.min(100, allStores.length)
    for (let i = 0; i < sampleSize; i++) {
      if (allStores[i]?.country) {
        countries.add(allStores[i].country)
      }
    }

    return countries
  }, [propStores, rawStoreData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Lojas Descobertas</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-[#9ae600]/80 text-black border-[#9ae600] font-semibold">
            {filteredIndices.length} Lojas {countryFilter && countryFilter !== "all" ? `- ${countryFilter}` : "Ativas"}
          </Badge>
          {rawStoreData.length > 0 && (
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {uniqueCountries.size}+ Países
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStores.map((store) => (
          <ShopifyStoreCard key={store.id} store={store} />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-[#9ae600]">
            <div className="w-4 h-4 border-2 border-[#9ae600] border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando mais lojas...</span>
          </div>
        </div>
      )}

      {!isLoading && displayedCount < filteredIndices.length && (
        <div className="flex justify-center py-8">
          <Button
            onClick={loadMoreStores}
            variant="outline"
            className="border-[#9ae600] text-[#9ae600] hover:bg-[#9ae600] hover:text-black bg-transparent"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Carregar mais lojas ({filteredIndices.length - displayedCount} restantes)
          </Button>
        </div>
      )}

      {displayedCount >= filteredIndices.length && filteredIndices.length > 6 && (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9ae600]/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#9ae600]"></div>
            </div>
            <p className="text-[#9ae600] font-medium">Todos os itens foram carregados</p>
            <p className="text-neutral-400 text-sm">{filteredIndices.length} lojas exibidas</p>
          </div>
        </div>
      )}

      {filteredIndices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-400">Nenhuma loja encontrada</p>
        </div>
      )}
    </div>
  )
}
