"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-14 sm:py-20">
          <div className="mb-5 flex items-center gap-2">
            <Image src="/icons/skitbit-white.svg" alt="Skitbit logo" width={32} height={32} className="h-8 w-8" />
            <p className="text-sm uppercase tracking-[0.25em] text-lime-300/80">skitbit</p>
          </div>
          <h1 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Mineração</span>
            <span className="block text-lime-300 drop-shadow-[0_0_20px_rgba(132,204,22,0.35)]">Global</span>
            <span className="block">As maiores operações do mercado.</span>
          </h1>

          <div className="mt-8 max-w-2xl text-center">
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Acesse as estratégias e operações mais lucrativas do mercado de mineração. Transforme seu conhecimento em
              resultados extraordinários com nossa plataforma exclusiva.
            </p>
            <Button
              onClick={scrollToPricing}
              size="lg"
              className="bg-lime-400 text-black font-semibold px-8 py-3 rounded-lg
                         hover:bg-lime-300 hover:shadow-lg hover:scale-105
                         transition-all duration-200"
            >
              Ver Preços
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
