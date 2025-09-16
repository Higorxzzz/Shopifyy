"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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

interface StoreContextType {
  stores: Store[]
  setStores: (stores: Store[]) => void
  addStores: (newStores: Store[]) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([])

  // Load stores from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("skitbit-content")
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent)
        if (parsedContent.stores) {
          setStores(parsedContent.stores)
        }
      } catch (error) {
        console.error("Error loading stores from localStorage:", error)
      }
    }
  }, [])

  // Listen for storage changes (when admin updates stores)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedContent = localStorage.getItem("skitbit-content")
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent)
          if (parsedContent.stores) {
            setStores(parsedContent.stores)
          }
        } catch (error) {
          console.error("Error loading stores from localStorage:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check periodically for updates
    const interval = setInterval(handleStorageChange, 2000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const addStores = (newStores: Store[]) => {
    setStores((prev) => [...prev, ...newStores])
  }

  return <StoreContext.Provider value={{ stores, setStores, addStores }}>{children}</StoreContext.Provider>
}

export function useStores() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStores must be used within a StoreProvider")
  }
  return context
}
