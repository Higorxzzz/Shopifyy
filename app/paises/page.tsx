"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { ShopifyStoreGrid } from "@/components/shopify-store-grid"
import Plasma from "@/components/plasma"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaisesPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [availableCountries, setAvailableCountries] = useState<string[]>([])

  useEffect(() => {
    const existingContent = localStorage.getItem("skitbit-content")
    if (existingContent) {
      const content = JSON.parse(existingContent)
      if (content.stores) {
        const countries = [...new Set(content.stores.map((store: any) => store.country).filter(Boolean))]
        setAvailableCountries(countries.sort())
      }
    }
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
            <h1 className="text-3xl font-bold mb-2">Países</h1>
            <p className="text-gray-300">Explore lojas Shopify organizadas por países e regiões</p>

            <div className="mt-6 flex items-center gap-4">
              <label htmlFor="country-filter" className="text-sm font-medium text-gray-300">
                Filtrar por país:
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-48 bg-[#1a1a1a] border-gray-700 text-white">
                  <SelectValue placeholder="Selecione um país" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    Todos os países
                  </SelectItem>
                  {availableCountries.map((country) => (
                    <SelectItem key={country} value={country} className="text-white hover:bg-gray-800">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ShopifyStoreGrid countryFilter={selectedCountry} />
        </main>
      </div>
    </>
  )
}
