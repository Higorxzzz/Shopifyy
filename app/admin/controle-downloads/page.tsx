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
  FileText,
  CheckCircle,
  AlertCircle,
  Home,
  Store,
  Package,
  Download,
  Trash2,
  ExternalLink,
  Edit,
  Loader2,
  Link,
  Menu,
  X,
} from "lucide-react"

export default function ControleDownloads() {
  const [uploadedFile, setUploadedFile] = useState<any[]>([])
  const [isFileReady, setIsFileReady] = useState(false)
  const [fileInfo, setFileInfo] = useState({ rows: 0 })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  const [rawDownloadData, setRawDownloadData] = useState<any[]>([])
  const [displayedDownloads, setDisplayedDownloads] = useState<any[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreDownloads, setHasMoreDownloads] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)
  const DOWNLOADS_PER_BATCH = 10

  const [selectedDownloads, setSelectedDownloads] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)

  const [directUrl, setDirectUrl] = useState("")
  const [isAddingUrl, setIsAddingUrl] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [editingDownload, setEditingDownload] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    url: "",
    description: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredRawDownloads = useMemo(() => {
    if (!searchTerm) return rawDownloadData

    const searchLower = searchTerm.toLowerCase()
    return rawDownloadData.filter(
      (download) =>
        download.url?.toLowerCase().includes(searchLower) ||
        download.title?.toLowerCase().includes(searchLower) ||
        download.description?.toLowerCase().includes(searchLower),
    )
  }, [rawDownloadData, searchTerm])

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
    loadDownloads()
  }, [router])

  const loadDownloads = () => {
    const existingContent = localStorage.getItem("skitbit-content")
    if (existingContent) {
      const content = JSON.parse(existingContent)
      if (content.downloads) {
        setRawDownloadData(content.downloads)
        loadInitialBatch(content.downloads)
      }
    }
  }

  const loadInitialBatch = (downloads: any[]) => {
    const initialDownloads = downloads.slice(0, DOWNLOADS_PER_BATCH)
    setDisplayedDownloads(initialDownloads)
    setCurrentBatch(1)
    setHasMoreDownloads(downloads.length > DOWNLOADS_PER_BATCH)
    setAllLoaded(downloads.length <= DOWNLOADS_PER_BATCH)
  }

  const loadMoreDownloads = useCallback(() => {
    if (isLoadingMore || !hasMoreDownloads) return

    setIsLoadingMore(true)

    setTimeout(() => {
      const startIndex = currentBatch * DOWNLOADS_PER_BATCH
      const endIndex = startIndex + DOWNLOADS_PER_BATCH
      const nextBatch = filteredRawDownloads.slice(startIndex, endIndex)

      if (nextBatch.length > 0) {
        setDisplayedDownloads((prev) => [...prev, ...nextBatch])
        setCurrentBatch((prev) => prev + 1)
        setHasMoreDownloads(endIndex < filteredRawDownloads.length)

        if (endIndex >= filteredRawDownloads.length) {
          setAllLoaded(true)
        }
      } else {
        setHasMoreDownloads(false)
        setAllLoaded(true)
      }

      setIsLoadingMore(false)
    }, 300)
  }, [currentBatch, isLoadingMore, hasMoreDownloads, filteredRawDownloads])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
          loadMoreDownloads()
        }
      }, 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [loadMoreDownloads])

  useEffect(() => {
    const initialDownloads = filteredRawDownloads.slice(0, DOWNLOADS_PER_BATCH)
    setDisplayedDownloads(initialDownloads)
    setCurrentBatch(1)
    setHasMoreDownloads(filteredRawDownloads.length > DOWNLOADS_PER_BATCH)
    setAllLoaded(filteredRawDownloads.length <= DOWNLOADS_PER_BATCH)
    setSelectedDownloads(new Set())
  }, [filteredRawDownloads])

  const handleLogout = () => {
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/admin/login")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")
    setIsFileReady(false)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim() !== "")

      if (lines.length === 0) {
        throw new Error("Arquivo deve conter pelo menos uma URL")
      }

      setUploadedFile(lines)
      setFileInfo({ rows: lines.length })
      setIsFileReady(true)
      setUploadStatus("success")
      setUploadMessage(`Arquivo validado! ${lines.length} URLs prontas para processamento.`)
    } catch (error) {
      console.error("[v0] Erro no upload:", error)
      setUploadStatus("error")
      setUploadMessage("Erro ao processar o arquivo. Verifique o formato.")
      setIsFileReady(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddDirectUrl = async () => {
    if (!directUrl.trim()) return

    setIsAddingUrl(true)

    try {
      const existingContent = localStorage.getItem("skitbit-content")
      let content = { downloads: [] }

      if (existingContent) {
        content = JSON.parse(existingContent)
      }

      if (!content.downloads) {
        content.downloads = []
      }

      const newDownload = {
        id: Date.now(),
        title: `Download ${content.downloads.length + 1}`,
        url: directUrl.trim(),
        description: "URL adicionada diretamente",
        createdAt: new Date().toISOString(),
      }

      content.downloads.unshift(newDownload)
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      setRawDownloadData([...content.downloads])
      loadInitialBatch(content.downloads)
      setDirectUrl("")
      setUploadStatus("success")
      setUploadMessage("URL adicionada com sucesso!")

      window.dispatchEvent(new Event("downloadsUpdated"))

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao adicionar URL:", error)
      setUploadStatus("error")
      setUploadMessage("Erro ao adicionar URL. Tente novamente.")
    } finally {
      setIsAddingUrl(false)
    }
  }

  const startProcessing = async () => {
    if (!isFileReady || uploadedFile.length === 0) return

    const CHUNK_SIZE = 30
    const totalRows = uploadedFile.length

    setIsProcessing(true)
    setTotalToProcess(totalRows)
    setProcessedCount(0)
    setProcessingProgress(0)

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { downloads: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    if (!content.downloads) {
      content.downloads = []
    }

    for (let i = 0; i < uploadedFile.length; i += CHUNK_SIZE) {
      const chunk = uploadedFile.slice(i, Math.min(i + CHUNK_SIZE, uploadedFile.length))

      const newDownloads = chunk.map((url: string, index: number) => ({
        id: Date.now() + i + index,
        title: `Download ${content.downloads.length + i + index + 1}`,
        url: url.trim(),
        description: "URL importada de arquivo .txt",
        createdAt: new Date().toISOString(),
      }))

      content.downloads.unshift(...newDownloads)
      localStorage.setItem("skitbit-content", JSON.stringify(content))
      setRawDownloadData([...content.downloads])

      const processed = Math.min(i + CHUNK_SIZE, totalRows)
      setProcessedCount(processed)
      setProcessingProgress((processed / totalRows) * 100)

      if (i === 0) {
        loadInitialBatch(content.downloads)
        window.dispatchEvent(new Event("downloadsUpdated"))
      }

      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    setIsProcessing(false)
    setIsFileReady(false)
    setUploadedFile([])
    setUploadStatus("success")
    setUploadMessage(`${totalRows} URLs processadas com sucesso!`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    window.dispatchEvent(new Event("downloadsUpdated"))
  }

  const handleDownloadSelection = (downloadId: number, checked: boolean) => {
    const newSelected = new Set(selectedDownloads)
    if (checked) {
      newSelected.add(downloadId)
    } else {
      newSelected.delete(downloadId)
    }
    setSelectedDownloads(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageDownloads = displayedDownloads.map((download) => download.id)
      const newSelected = new Set([...selectedDownloads, ...currentPageDownloads])
      setSelectedDownloads(newSelected)
    } else {
      const currentPageDownloads = new Set(displayedDownloads.map((download) => download.id))
      const newSelected = new Set([...selectedDownloads].filter((id) => !currentPageDownloads.has(id)))
      setSelectedDownloads(newSelected)
    }
  }

  const handleRemoveSelected = () => {
    if (selectedDownloads.size === 0) return

    const updatedDownloads = rawDownloadData.filter((download) => !selectedDownloads.has(download.id))

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { downloads: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.downloads = updatedDownloads
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("downloadsUpdated"))

    setRawDownloadData(updatedDownloads)
    loadInitialBatch(updatedDownloads)
    setSelectedDownloads(new Set())
  }

  const handleEditDownload = (download: any) => {
    setEditingDownload(download)
    setEditForm({
      title: download.title,
      url: download.url,
      description: download.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingDownload) return

    const updatedDownloads = rawDownloadData.map((download) =>
      download.id === editingDownload.id
        ? {
            ...download,
            title: editForm.title,
            url: editForm.url,
            description: editForm.description,
          }
        : download,
    )

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { downloads: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.downloads = updatedDownloads
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("downloadsUpdated"))

    setRawDownloadData(updatedDownloads)

    setDisplayedDownloads((prev) =>
      prev.map((download) => (download.id === editingDownload.id ? { ...download, ...editForm } : download)),
    )

    setEditingDownload(null)
    setIsEditDialogOpen(false)
  }

  const handleCancelEdit = () => {
    setEditingDownload(null)
    setEditForm({
      title: "",
      url: "",
      description: "",
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteAllDownloads = async () => {
    if (deletePassword !== "admin123") {
      setDeleteError("Senha incorreta")
      return
    }

    setIsDeleting(true)
    setDeleteError("")

    try {
      const existingContent = localStorage.getItem("skitbit-content")
      let content = { downloads: [] }

      if (existingContent) {
        content = JSON.parse(existingContent)
      }

      content.downloads = []
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      setRawDownloadData([])
      setDisplayedDownloads([])
      setSelectedDownloads(new Set())
      setCurrentBatch(0)
      setHasMoreDownloads(false)
      setAllLoaded(true)

      window.dispatchEvent(new Event("downloadsUpdated"))

      setShowDeleteDialog(false)
      setDeletePassword("")

      setUploadStatus("success")
      setUploadMessage("Todos os downloads foram removidos com sucesso!")

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao limpar downloads:", error)
      setDeleteError("Erro ao limpar downloads. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setDeletePassword("")
    setDeleteError("")
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
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => {
              router.push("/admin/controle-lojas")
              setSidebarOpen(false)
            }}
          >
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
          <Button variant="ghost" className="w-full justify-start bg-neutral-800 text-white">
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
                  placeholder="Buscar downloads..."
                  className="pl-10 bg-neutral-800 border border-neutral-700 text-white w-80"
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Controle de Downloads</h1>
            <div className="flex items-center gap-3">
              {selectedDownloads.size > 0 && (
                <Button variant="destructive" onClick={handleRemoveSelected} className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Selecionados ({selectedDownloads.size})
                </Button>
              )}
              {rawDownloadData.length > 0 && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                      title="Limpar todos os downloads"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a1a] border-neutral-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">Limpar Todos os Downloads</AlertDialogTitle>
                      <AlertDialogDescription className="text-neutral-400">
                        Esta ação irá remover permanentemente todos os {rawDownloadData.length} downloads cadastrados.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="delete-password" className="text-white mb-2 block">
                          Digite a senha para confirmar:
                        </Label>
                        <Input
                          id="delete-password"
                          type="password"
                          placeholder="Digite a senha..."
                          value={deletePassword}
                          onChange={(e) => {
                            setDeletePassword(e.target.value)
                            setDeleteError("")
                          }}
                          className="bg-neutral-800 border-neutral-700 text-white"
                          disabled={isDeleting}
                        />
                        {deleteError && <p className="text-red-400 text-sm mt-2">{deleteError}</p>}
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={handleCancelDelete}
                        className="border-neutral-700 text-neutral-300 bg-transparent hover:bg-neutral-800"
                        disabled={isDeleting}
                      >
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllDownloads}
                        disabled={isDeleting || !deletePassword}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Limpando...
                          </>
                        ) : (
                          "Limpar Todos"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova URL
              </Button>
            </div>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Link className="h-5 w-5" />
                Adicionar URL Diretamente
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Cole uma URL para adicionar rapidamente à página Downloads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Cole a URL aqui..."
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C6FF3A] file:text-black hover:file:bg-[#C6FF3A]/90 disabled:opacity-50"
                />
                <Button
                  onClick={handleAddDirectUrl}
                  disabled={!directUrl.trim() || isAddingUrl}
                  className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
                >
                  {isAddingUrl ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-lg">
                <p className="text-sm text-neutral-400">
                  Cole qualquer URL e clique em "Adicionar" para publicar na página Downloads
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload de URLs (.txt)
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Faça upload de um arquivo .txt com URLs (uma por linha) para adicionar à página Downloads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Arquivo .txt com URLs</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={isUploading || isProcessing}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C6FF3A] file:text-black hover:file:bg-[#C6FF3A]/90 disabled:opacity-50"
                />
              </div>

              {isFileReady && !isProcessing && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Arquivo pronto para processamento</p>
                      <p className="text-sm text-blue-200">
                        {fileInfo.rows} URLs serão processadas em lotes de 30 URLs
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
                    As URLs estão sendo adicionadas gradualmente. Processando 30 URLs a cada 150ms.
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

              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Formato do arquivo:</h4>
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>• Cada linha deve conter uma URL</p>
                  <p>• Exemplo:</p>
                  <div className="bg-neutral-900 p-2 rounded mt-2 font-mono text-xs">
                    <p>https://example.com/file1.zip</p>
                    <p>https://example.com/file2.pdf</p>
                    <p>https://example.com/file3.docx</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Lista de Downloads ({filteredRawDownloads.length})
                    {isProcessing && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 ml-2">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Processando...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Gerencie todas as URLs cadastradas na página Downloads
                  </CardDescription>
                </div>
                {displayedDownloads.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        displayedDownloads.every((download) => selectedDownloads.has(download.id)) &&
                        displayedDownloads.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm text-neutral-400">Selecionar todos</Label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredRawDownloads.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">Nenhum download encontrado</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {searchTerm ? "Tente ajustar sua busca" : "Faça upload de um arquivo .txt para adicionar URLs"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {displayedDownloads.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-colors"
                      >
                        <Checkbox
                          checked={selectedDownloads.has(download.id)}
                          onCheckedChange={(checked) => handleDownloadSelection(download.id, checked as boolean)}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{download.title}</span>
                              <a
                                href={download.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-[#C6FF3A] transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <p className="text-sm text-neutral-400 truncate">{download.url}</p>
                          </div>
                          <div>
                            <p className="text-white font-medium">{download.description}</p>
                            <p className="text-sm text-neutral-400">
                              {new Date(download.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDownload(download)}
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
                      <span className="text-neutral-400">Carregando mais downloads...</span>
                    </div>
                  )}

                  {allLoaded && displayedDownloads.length > 0 && (
                    <div className="text-center py-6 border-t border-neutral-800">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-neutral-400 text-sm">Todos os itens foram carregados</span>
                      </div>
                    </div>
                  )}

                  {displayedDownloads.length > 0 && (
                    <div className="text-center text-sm text-neutral-500 pt-4">
                      Mostrando {displayedDownloads.length} de {filteredRawDownloads.length} downloads
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Editar Download</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Edite as informações do download selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="col-span-3 bg-neutral-800 border-neutral-700"
              />
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
