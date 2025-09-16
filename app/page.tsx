import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Pricing } from "@/components/pricing"
import { AppverseFooter } from "@/components/appverse-footer"
import Script from "next/script"

// ✅ Force static generation for low TTFB
export const dynamic = "force-static"

export default function Page() {
  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": "https://theskitbit.com/#pricing",
    name: "Pricing Plans",
    description: "3D Animation pricing plan - Professional Pro package for all business needs",
    url: "https://theskitbit.com/#pricing",
    mainEntity: {
      "@type": "PriceSpecification",
      name: "3D Animation Services",
      description: "Professional 3D animation services with Pro pricing tier",
      offers: [
        {
          "@type": "Offer",
          name: "Pro Plan",
          price: "699",
          priceCurrency: "USD",
          description: "Up to 25s 3D Animation with 4 revisions",
        },
      ],
    },
  }

  // Structured data for main page
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://theskitbit.com/",
    name: "Skitbit | 3D Animation Made Simple, Reliable & Scalable",
    description:
      "From product launches to full-scale campaigns, Skitbit delivers 3D animation that's fast, consistent, and built to wow your audience.",
    url: "https://theskitbit.com/",
    mainEntity: {
      "@type": "Organization",
      name: "Skitbit",
      url: "https://theskitbit.com",
      sameAs: [
        "https://twitter.com/theskitbit",
        "https://www.youtube.com/@skitbitinternational",
        "https://instagram.com/theskitbit",
        "https://threads.com/theskitbit",
      ],
    },
    hasPart: [
      {
        "@type": "WebPageElement",
        "@id": "https://theskitbit.com/#pricing",
        name: "Pricing Section",
        url: "https://theskitbit.com/#pricing",
      },
    ],
  }

  return (
    <>
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <Hero />

        <section id="explicacao" className="container mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">Como Funciona</h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Assista ao vídeo explicativo sobre nossos serviços de animação 3D
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Explicação dos Serviços Skitbit"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <Pricing />
        <AppverseFooter />
      </main>

      {/* JSON-LD structured data */}
      <Script
        id="pricing-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingStructuredData),
        }}
      />

      <Script
        id="page-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageStructuredData),
        }}
      />
    </>
  )
}
