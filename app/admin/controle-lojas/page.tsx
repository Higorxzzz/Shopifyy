"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  LogOut,
  Plus,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Home,
  Store,
  Package,
  Trash2,
  ExternalLink,
  Edit,
  Loader2,
  Download,
  Menu,
  X,
} from "lucide-react"
import * as XLSX from "xlsx"

const countries = [
  "Brasil",
  "Estados Unidos",
  "Canadá",
  "Reino Unido",
  "Alemanha",
  "França",
  "Espanha",
  "Itália",
  "Portugal",
  "Argentina",
  "Chile",
  "Colômbia",
  "México",
  "Peru",
  "Uruguai",
  "Austrália",
  "Japão",
]

export default function ControleLojas() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  const [uploadedFile, setUploadedFile] = useState<any[]>([])
  const [isFileReady, setIsFileReady] = useState(false)
  const [fileInfo, setFileInfo] = useState({ rows: 0, country: "" })

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)

  const [rawStoreData, setRawStoreData] = useState<any[]>([])
  const [displayedStores, setDisplayedStores] = useState<any[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreStores, setHasMoreStores] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)
  const STORES_PER_BATCH = 6

  const [selectedStores, setSelectedStores] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [editingStore, setEditingStore] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    domain: "",
    revenue: "",
    products: "",
    trafficRank: "",
    country: "",
  })

  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearPassword, setClearPassword] = useState("")
  const [clearError, setClearError] = useState("")
  const [isClearing, setIsClearing] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(";")
      const adminSession = cookies.find((cookie) => cookie.trim().startsWith("admin-session="))

      if (!adminSession || !adminSession.includes("authenticated")) {
        router.push("/admin/login")
        return
      }
    }

    checkAuth()
    loadStores()
  }, [router])

  const loadStores = () => {
    const existingContent = localStorage.getItem("skitbit-content")
    if (existingContent) {
      const content = JSON.parse(existingContent)
      if (content.stores) {
        setRawStoreData(content.stores)
        loadInitialBatch(content.stores)
      }
    }
  }

  const loadInitialBatch = (stores: any[]) => {
    const initialStores = stores.slice(0, STORES_PER_BATCH)
    setDisplayedStores(initialStores)
    setCurrentBatch(1)
    setHasMoreStores(stores.length > STORES_PER_BATCH)
    setAllLoaded(stores.length <= STORES_PER_BATCH)
  }

  const loadMoreStores = useCallback(() => {
    if (isLoadingMore || !hasMoreStores) return

    setIsLoadingMore(true)

    setTimeout(() => {
      const startIndex = currentBatch * STORES_PER_BATCH
      const endIndex = startIndex + STORES_PER_BATCH
      const nextBatch = filteredRawStores.slice(startIndex, endIndex)

      if (nextBatch.length > 0) {
        setDisplayedStores((prev) => [...prev, ...nextBatch])
        setCurrentBatch((prev) => prev + 1)
        setHasMoreStores(endIndex < filteredRawStores.length)

        if (endIndex >= filteredRawStores.length) {
          setAllLoaded(true)
        }
      } else {
        setHasMoreStores(false)
        setAllLoaded(true)
      }

      setIsLoadingMore(false)
    }, 300)
  }, [currentBatch, isLoadingMore, hasMoreStores])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
          loadMoreStores()
        }
      }, 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [loadMoreStores])

  const filteredRawStores = useMemo(() => {
    if (!searchTerm) return rawStoreData

    const searchLower = searchTerm.toLowerCase()
    return rawStoreData.filter(
      (store) =>
        store.domain?.toLowerCase().includes(searchLower) ||
        store.country?.toLowerCase().includes(searchLower) ||
        store.name?.toLowerCase().includes(searchLower),
    )
  }, [rawStoreData, searchTerm])

  useEffect(() => {
    const initialStores = filteredRawStores.slice(0, STORES_PER_BATCH)
    setDisplayedStores(initialStores)
    setCurrentBatch(1)
    setHasMoreStores(filteredRawStores.length > STORES_PER_BATCH)
    setAllLoaded(filteredRawStores.length <= STORES_PER_BATCH)
    setSelectedStores(new Set())
  }, [filteredRawStores])

  const handleLogout = () => {
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/admin/login")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedCountry) return

    setIsUploading(true)
    setUploadStatus("idle")
    setIsFileReady(false)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        throw new Error("Arquivo deve conter pelo menos uma linha de dados")
      }

      setUploadedFile(jsonData)
      setFileInfo({ rows: jsonData.length - 1, country: selectedCountry })
      setIsFileReady(true)
      setUploadStatus("success")
      setUploadMessage(`Arquivo validado! ${jsonData.length - 1} linhas prontas para processamento.`)
    } catch (error) {
      console.error("[v0] Erro no upload:", error)
      setUploadStatus("error")
      setUploadMessage("Erro ao processar o arquivo. Verifique o formato.")
      setIsFileReady(false)
    } finally {
      setIsUploading(false)
    }
  }

  const startProcessing = async () => {
    if (!isFileReady || uploadedFile.length === 0) return

    const CHUNK_SIZE = 30 // Processando 30 linhas por vez
    const totalRows = uploadedFile.length - 1

    setIsProcessing(true)
    setTotalToProcess(totalRows)
    setProcessedCount(0)
    setProcessingProgress(0)

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { stores: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    if (!content.stores) {
      content.stores = []
    }

    for (let i = 1; i < uploadedFile.length; i += CHUNK_SIZE) {
      const chunk = uploadedFile.slice(i, Math.min(i + CHUNK_SIZE, uploadedFile.length))

      const newStores = chunk.map((row: any, index: number) => ({
        id: Date.now() + (i - 1) + index,
        name: `Loja ${(i - 1) + index + 1}`,
        domain: row[0] || "",
        revenue: row[1] || "R$ 0",
        products: row[2] || "0",
        trafficRank: row[3] || "0",
        country: fileInfo.country,
        monthlyVisitors: "0",
        conversionRate: "0%",
        topProducts: [],
        adSpend: "$0",
        roas: "0x",
        category: "Geral",
        founded: "2024",
        employees: "1-10",
        image: "",
        status: "Ativa",
        growth: "0%",
      }))

      content.stores.push(...newStores)
      localStorage.setItem("skitbit-content", JSON.stringify(content))
      setRawStoreData([...content.stores])

      const processed = Math.min(i + CHUNK_SIZE - 1, totalRows)
      setProcessedCount(processed)
      setProcessingProgress((processed / totalRows) * 100)

      if (i === 1) {
        loadInitialBatch(content.stores)
        window.dispatchEvent(new Event("storesUpdated"))
      }

      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    setIsProcessing(false)
    setIsFileReady(false)
    setUploadedFile([])
    setUploadStatus("success")
    setUploadMessage(`${totalRows} lojas processadas com sucesso!`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setSelectedCountry("")

    window.dispatchEvent(new Event("storesUpdated"))
  }

  const handleStoreSelection = (storeId: number, checked: boolean) => {
    const newSelected = new Set(selectedStores)
    if (checked) {
      newSelected.add(storeId)
    } else {
      newSelected.delete(storeId)
    }
    setSelectedStores(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageStores = displayedStores.map((store) => store.id)
      const newSelected = new Set([...selectedStores, ...currentPageStores])
      setSelectedStores(newSelected)
    } else {
      const currentPageStores = new Set(displayedStores.map((store) => store.id))
      const newSelected = new Set([...selectedStores].filter((id) => !currentPageStores.has(id)))
      setSelectedStores(newSelected)
    }
  }

  const handleRemoveSelected = () => {
    if (selectedStores.size === 0) return

    const updatedStores = rawStoreData.filter((store) => !selectedStores.has(store.id))

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { stores: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.stores = updatedStores
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("storesUpdated"))

    setRawStoreData(updatedStores)
    loadInitialBatch(updatedStores)
    setSelectedStores(new Set())
  }

  const handleEditStore = (store: any) => {
    setEditingStore(store)
    setEditForm({
      name: store.name,
      domain: store.domain,
      revenue: store.revenue,
      products: store.products,
      trafficRank: store.trafficRank,
      country: store.country,
    })
  }

  const handleSaveEdit = () => {
    if (!editingStore) return

    const updatedStores = rawStoreData.map((store) =>
      store.id === editingStore.id
        ? {
            ...store,
            name: editForm.name,
            domain: editForm.domain,
            revenue: editForm.revenue,
            products: editForm.products,
            trafficRank: editForm.trafficRank,
            country: editForm.country,
          }
        : store,
    )

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { stores: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.stores = updatedStores
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("storesUpdated"))

    setRawStoreData(updatedStores)

    setDisplayedStores((prev) =>
      prev.map((store) => (store.id === editingStore.id ? { ...store, ...editForm } : store)),
    )

    setEditingStore(null)
  }

  const handleCancelEdit = () => {
    setEditingStore(null)
    setEditForm({
      name: "",
      domain: "",
      revenue: "",
      products: "",
      trafficRank: "",
      country: "",
    })
  }

  const handleClearAllStores = async () => {
    if (clearPassword !== "admin123") {
      setClearError("Senha incorreta")
      return
    }

    setIsClearing(true)
    setClearError("")

    try {
      // Limpar localStorage
      const existingContent = localStorage.getItem("skitbit-content")
      let content = { stores: [] }

      if (existingContent) {
        content = JSON.parse(existingContent)
      }

      content.stores = []
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      // Atualizar estados
      setRawStoreData([])
      setDisplayedStores([])
      setSelectedStores(new Set())
      setCurrentBatch(0)
      setHasMoreStores(false)
      setAllLoaded(true)

      // Disparar evento para outras partes da aplicação
      window.dispatchEvent(new Event("storesUpdated"))

      // Fechar diálogo
      setShowClearDialog(false)
      setClearPassword("")

      // Mostrar mensagem de sucesso
      setUploadStatus("success")
      setUploadMessage("Todas as lojas foram removidas com sucesso!")

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao limpar lojas:", error)
      setClearError("Erro ao limpar lojas. Tente novamente.")
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearDialogClose = () => {
    setShowClearDialog(false)
    setClearPassword("")
    setClearError("")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f0f0f] border-r border-neutral-800 h-screen
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex items-center gap-3 mb-8 p-6">
          <div className="w-8 h-8 bg-[#C6FF3A] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">SK</span>
          </div>
          <span className="text-xl font-semibold text-white">Skitbit Admin</span>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden ml-auto text-white hover:text-[#C6FF3A]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2 px-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => {
              router.push("/admin")
              setSidebarOpen(false)
            }}
          >
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start bg-neutral-800 text-white">
            <Store className="h-4 w-4 mr-3" />
            Controle de Lojas
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => {
              router.push("/admin/controle-produtos")
              setSidebarOpen(false)
            }}
          >
            <Package className="h-4 w-4 mr-3" />
            Controle de Produtos
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => {
              router.push("/admin/controle-downloads")
              setSidebarOpen(false)
            }}
          >
            <Download className="h-4 w-4 mr-3" />
            Controle de Downloads
          </Button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Button
            onClick={() => {
              router.push("/")
              setSidebarOpen(false)
            }}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-0">
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="lg:hidden text-white hover:text-[#C6FF3A]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Buscar lojas..."
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ... existing title and buttons ... */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Controle de Lojas</h1>
            <div className="flex items-center gap-3">
              {rawStoreData.length > 0 && (
                <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                      title="Limpar todas as lojas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a1a] border-neutral-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">Limpar Todas as Lojas</AlertDialogTitle>
                      <AlertDialogDescription className="text-neutral-400">
                        Esta ação irá remover permanentemente todas as {rawStoreData.length} lojas cadastradas. Esta
                        ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="clear-password" className="text-white mb-2 block">
                          Digite a senha para confirmar:
                        </Label>
                        <Input
                          id="clear-password"
                          type="password"
                          placeholder="Digite a senha..."
                          value={clearPassword}
                          onChange={(e) => {
                            setClearPassword(e.target.value)
                            setClearError("")
                          }}
                          className="bg-neutral-800 border-neutral-700 text-white"
                          disabled={isClearing}
                        />
                        {clearError && <p className="text-red-400 text-sm mt-2">{clearError}</p>}
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={handleClearDialogClose}
                        className="border-neutral-700 text-neutral-300 bg-transparent hover:bg-neutral-800"
                        disabled={isClearing}
                      >
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllStores}
                        disabled={isClearing || !clearPassword}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isClearing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Limpando...
                          </>
                        ) : (
                          "Limpar Todas"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {selectedStores.size > 0 && (
                <Button variant="destructive" onClick={handleRemoveSelected} className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Selecionadas ({selectedStores.size})
                </Button>
              )}
              <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova Loja
              </Button>
            </div>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload de Lojas (.xlsx)
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Faça upload de um arquivo .xlsx para adicionar lojas automaticamente à Área de Membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Selecione o País</Label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={isProcessing || isUploading}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Escolha um país...</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Arquivo .xlsx</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isUploading || !selectedCountry || isProcessing}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C6FF3A] file:text-black hover:file:bg-[#C6FF3A]/90 disabled:opacity-50"
                  />
                </div>
              </div>

              {isFileReady && !isProcessing && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Arquivo pronto para processamento</p>
                      <p className="text-sm text-blue-200">
                        {fileInfo.rows} linhas serão processadas em lotes de 30 linhas
                      </p>
                    </div>
                    <Button onClick={startProcessing} className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
                      Iniciar Processamento
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      Processando arquivo... ({processedCount}/{totalToProcess})
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-[#C6FF3A] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-2 text-blue-200">
                    Os cards estão sendo adicionados gradualmente. Processando 30 linhas a cada 150ms.
                  </p>
                </div>
              )}

              {uploadStatus === "success" && !isProcessing && !isFileReady && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>{uploadMessage}</span>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <span>{uploadMessage}</span>
                </div>
              )}

              {/* ... existing format info ... */}
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Formato do arquivo:</h4>
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>• Coluna 1: Link da loja</p>
                  <p>• Coluna 2: Faturamento</p>
                  <p>• Coluna 3: Produtos</p>
                  <p>• Coluna 4: Rank de tráfego</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ... existing store list card ... */}
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Lista de Lojas ({filteredRawStores.length})
                    {isProcessing && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 ml-2">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Processando...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Gerencie todas as lojas cadastradas na plataforma
                  </CardDescription>
                </div>
                {displayedStores.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        displayedStores.every((store) => selectedStores.has(store.id)) && displayedStores.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm text-neutral-400">Selecionar todas</Label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* ... existing store list content ... */}
              {filteredRawStores.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">Nenhuma loja encontrada</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {searchTerm ? "Tente ajustar sua busca" : "Faça upload de um arquivo .xlsx para adicionar lojas"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {displayedStores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-colors"
                      >
                        <Checkbox
                          checked={selectedStores.has(store.id)}
                          onCheckedChange={(checked) => handleStoreSelection(store.id, checked as boolean)}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{store.name}</span>
                              <a
                                href={store.domain.startsWith("http") ? store.domain : `https://${store.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-[#C6FF3A] transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <p className="text-sm text-neutral-400">{store.domain}</p>
                          </div>
                          <div>
                            <p className="text-white font-medium">{store.revenue}</p>
                            <p className="text-sm text-neutral-400">Faturamento</p>
                          </div>
                          <div>
                            <p className="text-white font-medium">{store.products} produtos</p>
                            <p className="text-sm text-neutral-400">Rank: {store.trafficRank}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="bg-[#C6FF3A]/20 text-[#C6FF3A] w-fit">
                                {store.country}
                              </Badge>
                              <Badge variant="outline" className="border-green-500/30 text-green-400 w-fit">
                                {store.status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStore(store)}
                              className="text-neutral-400 hover:text-[#C6FF3A] hover:bg-neutral-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-[#C6FF3A] mr-2" />
                      <span className="text-neutral-400">Carregando mais lojas...</span>
                    </div>
                  )}

                  {allLoaded && displayedStores.length > 0 && (
                    <div className="text-center py-6 border-t border-neutral-800">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-neutral-400 text-sm">Todos os itens foram carregados</span>
                      </div>
                    </div>
                  )}

                  {displayedStores.length > 0 && (
                    <div className="text-center text-sm text-neutral-500 pt-4">
                      Mostrando {displayedStores.length} de {filteredRawStores.length} lojas
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ... existing dialog code ... */}
      <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
        <DialogContent className="bg-[#1a1a1a] border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Editar Loja</DialogTitle>
            <DialogDescription className="text-neutral-400">Edite as informações da loja selecionada</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right">
                Domínio
              </Label>
              <Input
                id="domain"
                value={editForm.domain}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="revenue" className="text-right">
                Faturamento
              </Label>
              <Input
                id="revenue"
                value={editForm.revenue}
                onChange={(e) => setEditForm({ ...editForm, revenue: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="products" className="text-right">
                Produtos
              </Label>
              <Input
                id="products"
                value={editForm.products}
                onChange={(e) => setEditForm({ ...editForm, products: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trafficRank" className="text-right">
                Rank de Tráfego
              </Label>
              <Input
                id="trafficRank"
                value={editForm.trafficRank}
                onChange={(e) => setEditForm({ ...editForm, trafficRank: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                País
              </Label>
              <select
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                className="col-span-3 p-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="border-neutral-700 text-neutral-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
