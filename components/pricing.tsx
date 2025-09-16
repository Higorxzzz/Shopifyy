"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { ExamplesDialog } from "./examples-dialog"

type Feature = { text: string; muted?: boolean }

const ACCENT = "#C6FF3A"

function FeatureItem({ text, muted = false }: Feature) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4" style={{ color: ACCENT }} />
      <span className={`text-sm ${muted ? "text-neutral-500" : "text-neutral-200"}`}>{text}</span>
    </li>
  )
}

type Currency = "INR" | "USD"

const PRICES: Record<Currency, { pro: string; save: string }> = {
  INR: {
    pro: "₹55,000/-",
    save: "Save Flat ₹1,500/-",
  },
  USD: {
    pro: "$699",
    save: "Save $20",
  },
}

function guessLocalCurrency(): Currency {
  const lang = typeof navigator !== "undefined" ? navigator.language : ""
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : ""
  if (/-(IN|PK|BD)\b/i.test(lang) || /(Kolkata|Karachi|Dhaka)/i.test(tz || "")) return "INR"
  return "USD"
}

// Pro demo videos
const proVideos = [
  "ASV2myPRfKA",
  "eTfS2lqwf6A",
  "KALbYHmGV4I",
  "Go0AA9hZ4as",
  "sB7RZ9QCOAg",
  "TK2WboJOJaw",
  "5Xq7UdXXOxI",
  "kMjWCidQSK0",
  "RKKdQvwKOhQ",
]

export function Pricing() {
  const [openPlan, setOpenPlan] = useState<null | "Pro">(null)
  const [currency, setCurrency] = useState<Currency>("USD")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/geo", { cache: "no-store" })
        if (!res.ok) throw new Error("geo failed")
        const data = await res.json()
        if (!cancelled) setCurrency(data?.currency === "INR" ? "INR" : "USD")
      } catch {
        if (!cancelled) setCurrency(guessLocalCurrency())
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="pricing" className="text-white" itemScope itemType="https://schema.org/PriceSpecification">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mx-auto mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "rgba(198,255,58,0.9)",
              color: "#000000",
              border: "1px solid rgba(198,255,58,0.3)",
            }}
          >
            Our Pricing and Packages
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl" itemProp="name">
            Our Pricing.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-400" itemProp="description">
            No hidden fees. Just world-class animation that fits your budget.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-lg">
            <Card
              className="relative overflow-hidden rounded-2xl liquid-glass shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <CardHeader className="space-y-4 pb-6">
                <div className="text-lg font-semibold text-neutral-200" itemProp="name">
                  Pro
                </div>
                <div className="flex items-end gap-3 text-neutral-100">
                  <div className="text-3xl font-bold tracking-tight" itemProp="price">
                    {PRICES[currency].pro}
                  </div>
                  <span className="pb-1 text-sm text-neutral-400">,00</span>
                  <meta itemProp="priceCurrency" content={currency} />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="grid gap-3" itemProp="description">
                  {[
                    "20–25s Animation (1 SKU)",
                    "Fixed Shot-list (no surprises)",
                    "Creative background + pro graphics",
                    "2 structured revisions",
                    "Delivered in 3 weeks",
                    "3D Modelling - Included",
                  ].map((f, i) => (
                    <FeatureItem key={i} text={f} />
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    asChild
                    className="w-full rounded-full px-6 py-3 text-base font-medium text-black shadow transition-[box-shadow,transform,filter] active:translate-y-[1px]"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <Link href="/checkout?plan=pro">Comprar</Link>
                  </Button>
                </div>
              </CardContent>
              <CardFooter />
            </Card>
          </div>
        </div>
      </div>

      <ExamplesDialog
        open={openPlan === "Pro"}
        onOpenChange={(v) => setOpenPlan(v ? "Pro" : null)}
        planName="Pro Plan"
        price={PRICES[currency].pro}
        videoIds={proVideos}
      />
    </section>
  )
}
