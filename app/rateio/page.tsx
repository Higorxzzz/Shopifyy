"use client"

import { useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import Plasma from "@/components/plasma"

export default function RateioPage() {
  useEffect(() => {
    // Desabilita o scroll ao montar o componente
    document.body.style.overflow = "hidden"

    // Reabilita o scroll ao desmontar o componente
    return () => {
      document.body.style.overflow = "unset"
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
            <h1 className="text-3xl font-bold mb-2">Rateio</h1>
            <p className="text-gray-300">Acesse dados exclusivos das lojas Shopify mais lucrativas</p>
          </div>
        </main>
      </div>

      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center pointer-events-auto touch-none">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Em Desenvolvimento</h2>
          <p className="text-xl text-gray-300">Esta funcionalidade estará disponível em breve</p>
        </div>
      </div>
    </>
  )
}
