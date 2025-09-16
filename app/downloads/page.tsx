"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import Plasma from "@/components/plasma"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDownloads, setFilteredDownloads] = useState<any[]>([])

  useEffect(() => {
    const loadDownloads = () => {
      const existingContent = localStorage.getItem("skitbit-content")
      if (existingContent) {
        const content = JSON.parse(existingContent)
        if (content.downloads) {
          setDownloads(content.downloads)
          setFilteredDownloads(content.downloads)
        }
      }
    }

    loadDownloads()

    const handleDownloadsUpdate = () => {
      loadDownloads()
    }

    window.addEventListener("downloadsUpdated", handleDownloadsUpdate)

    return () => {
      window.removeEventListener("downloadsUpdated", handleDownloadsUpdate)
    }
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredDownloads(downloads)
    } else {
      const searchLower = searchTerm.toLowerCase()
      const filtered = downloads.filter((download) => download.url?.toLowerCase().includes(searchLower))
      setFilteredDownloads(filtered)
    }
  }, [searchTerm, downloads])

  return (
    <>
      <div className="fixed inset-0 z-0 bg-black">
        <Plasma color="#9ae600" speed={0.8} direction="forward" scale={1.5} opacity={0.4} mouseInteractive={true} />
      </div>
      <div className="relative z-10 min-h-screen text-white">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Downloads</h1>
            <p className="text-gray-300">Acesse links e recursos exclusivos da área de membros</p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Buscar downloads..."
                className="pl-10 bg-neutral-800/50 border-neutral-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="bg-[#1a1a1a]/80 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5" />
                Downloads Disponíveis ({filteredDownloads.length})
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Lista de recursos e links exclusivos para membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDownloads.length === 0 ? (
                <div className="text-center py-12">
                  <Download className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-lg mb-2">
                    {searchTerm ? "Nenhum download encontrado" : "Nenhum download disponível"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {searchTerm ? "Tente ajustar sua busca" : "Novos downloads serão adicionados em breve"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDownloads.map((download) => (
                    <div
                      key={download.id}
                      className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors border border-neutral-700/50"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{download.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-[#9ae600]/30 text-[#9ae600] hover:bg-[#9ae600]/10 bg-transparent"
                        >
                          <a
                            href={download.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Acessar
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
