import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { VideoGrid } from "@/components/video-grid"
import Plasma from "@/components/plasma"

export default function ProdutosPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-black">
        <Plasma color="#9ae600" speed={0.8} direction="forward" scale={1.5} opacity={0.4} mouseInteractive={true} />
      </div>
      <div className="relative z-10 min-h-screen text-white">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Produtos</h1>
            <p className="text-gray-300">Acesse vídeos exclusivos de produtos e estratégias</p>
          </div>
          <VideoGrid />
        </main>
      </div>
    </>
  )
}
