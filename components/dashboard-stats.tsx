"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Store, Eye, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardStats() {
  const [storeCount, setStoreCount] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedData = localStorage.getItem("shopify-stores-storage")
        if (storedData) {
          const parsed = JSON.parse(storedData)
          const stores = parsed?.state?.stores || []
          setStoreCount(stores.length)
        }
      } catch (error) {
        console.error("Erro ao ler localStorage:", error)
        setStoreCount(0)
      }
      setIsHydrated(true)
    }
  }, [])

  const stats = [
    {
      title: "Lojas Descobertas",
      value: isHydrated ? storeCount.toLocaleString() : "0",
      change: "+12%",
      icon: Store,
      color: "text-[#9ae600]",
    },
    {
      title: "Receita Trackeada",
      value: "8,932",
      change: "+23%",
      icon: Eye,
      color: "text-blue-400",
    },
    {
      title: "Tráfego Analisado",
      value: "$127K",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Plataforma com mais tráfego",
      value: "47",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="liquid-glass border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-white">
              <span className="text-[#39ff14] font-medium">{stat.change}</span> desde o mês passado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
