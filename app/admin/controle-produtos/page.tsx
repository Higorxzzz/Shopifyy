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
  Play,
  Loader2,
  Link,
  X,
  Menu,
} from "lucide-react"
import { VideoEmbed } from "@/components/video-embed"

const identifyVideoType = (url: string) => {
  if (url.includes("instagram.com") || url.includes("instagr.am")) {
    if (url.includes("/reel/")) {
      return "Instagram Reels"
    }
    return "Instagram"
  }
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    if (url.includes("/shorts/")) {
      return "YouTube Shorts"
    }
    return "YouTube"
  }
  if (url.includes("tiktok.com")) {
    return "TikTok"
  }
  if (url.includes("vimeo.com")) {
    return "Vimeo"
  }
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return "Facebook"
  }
  if (url.includes("twitter.com") || url.includes("x.com") || url.includes("t.co")) {
    return "X/Twitter"
  }
  return "Outro"
}

const extractVideoId = (url: string, type: string): string | null => {
  if (type === "YouTube" || type === "YouTube Shorts") {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    )
    return match ? match[1] : null
  }

  if (type === "Vimeo") {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match ? match[1] : null
  }

  if (type === "Instagram Reels" || type === "Instagram") {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/)
    return match ? match[1] : null
  }

  if (type === "TikTok") {
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
    return match ? match[1] : null
  }

  // Facebook, X/Twitter não precisam de ID específico para embed
  return null
}

const getVideoThumbnail = (url: string, type: string, videoId: string | null) => {
  if ((type === "YouTube" || type === "YouTube Shorts") && videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  if (type === "Vimeo" && videoId) {
    return `/placeholder.svg?height=640&width=360&query=Vimeo+Video+Preview`
  }

  if ((type === "Instagram Reels" || type === "Instagram") && videoId) {
    return `/placeholder.svg?height=640&width=360&query=Instagram+Preview`
  }

  if (type === "TikTok" && videoId) {
    return `/placeholder.svg?height=640&width=360&query=TikTok+Video+Preview`
  }

  if (type === "Facebook") {
    return `/placeholder.svg?height=640&width=360&query=Facebook+Video+Preview`
  }

  if (type === "X/Twitter") {
    return `/placeholder.svg?height=640&width=360&query=Twitter+Video+Preview`
  }

  return `/placeholder.svg?height=640&width=360&query=${type}+Video+Preview`
}

export default function ControleProdutos() {
  const [uploadedFile, setUploadedFile] = useState<any[]>([])
  const [isFileReady, setIsFileReady] = useState(false)
  const [fileInfo, setFileInfo] = useState({ rows: 0 })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  const [rawVideoData, setRawVideoData] = useState<any[]>([])
  const [displayedVideos, setDisplayedVideos] = useState<any[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreVideos, setHasMoreVideos] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)
  const VIDEOS_PER_BATCH = 6

  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set())
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
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    url: "",
    type: "",
    description: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredRawVideos = useMemo(() => {
    if (!searchTerm) return rawVideoData

    const searchLower = searchTerm.toLowerCase()
    return rawVideoData.filter(
      (video) =>
        video.url?.toLowerCase().includes(searchLower) ||
        video.type?.toLowerCase().includes(searchLower) ||
        video.title?.toLowerCase().includes(searchLower),
    )
  }, [rawVideoData, searchTerm])

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
    loadVideos()
  }, [router])

  const loadVideos = () => {
    const existingContent = localStorage.getItem("skitbit-content")
    if (existingContent) {
      const content = JSON.parse(existingContent)
      if (content.videos) {
        setRawVideoData(content.videos)
        loadInitialBatch(content.videos)
      }
    }
  }

  const loadInitialBatch = (videos: any[]) => {
    const initialVideos = videos.slice(0, VIDEOS_PER_BATCH)
    setDisplayedVideos(initialVideos)
    setCurrentBatch(1)
    setHasMoreVideos(videos.length > VIDEOS_PER_BATCH)
    setAllLoaded(videos.length <= VIDEOS_PER_BATCH)
  }

  const loadMoreVideos = useCallback(() => {
    if (isLoadingMore || !hasMoreVideos) return

    setIsLoadingMore(true)

    setTimeout(() => {
      const startIndex = currentBatch * VIDEOS_PER_BATCH
      const endIndex = startIndex + VIDEOS_PER_BATCH
      const nextBatch = filteredRawVideos.slice(startIndex, endIndex)

      if (nextBatch.length > 0) {
        setDisplayedVideos((prev) => [...prev, ...nextBatch])
        setCurrentBatch((prev) => prev + 1)
        setHasMoreVideos(endIndex < filteredRawVideos.length)

        if (endIndex >= filteredRawVideos.length) {
          setAllLoaded(true)
        }
      } else {
        setHasMoreVideos(false)
        setAllLoaded(true)
      }

      setIsLoadingMore(false)
    }, 300)
  }, [currentBatch, isLoadingMore, hasMoreVideos])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
          loadMoreVideos()
        }
      }, 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [loadMoreVideos])

  useEffect(() => {
    const initialVideos = filteredRawVideos.slice(0, VIDEOS_PER_BATCH)
    setDisplayedVideos(initialVideos)
    setCurrentBatch(1)
    setHasMoreVideos(filteredRawVideos.length > VIDEOS_PER_BATCH)
    setAllLoaded(filteredRawVideos.length <= VIDEOS_PER_BATCH)
    setSelectedVideos(new Set())
  }, [filteredRawVideos])

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
      const urls = text.split("\n").filter((url) => url.trim() !== "")

      if (urls.length === 0) {
        throw new Error("Arquivo vazio ou sem URLs válidas")
      }

      setUploadedFile(urls)
      setFileInfo({ rows: urls.length })
      setIsFileReady(true)
      setUploadStatus("success")
      setUploadMessage(`Arquivo validado! ${urls.length} URLs prontas para processamento.`)
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

    const CHUNK_SIZE = 30
    const totalUrls = uploadedFile.length

    setIsProcessing(true)
    setTotalToProcess(totalUrls)
    setProcessedCount(0)
    setProcessingProgress(0)

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { videos: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    if (!content.videos) {
      content.videos = []
    }

    for (let i = 0; i < uploadedFile.length; i += CHUNK_SIZE) {
      const chunk = uploadedFile.slice(i, Math.min(i + CHUNK_SIZE, uploadedFile.length))

      const newVideos = chunk.map((url: string, index: number) => {
        const cleanUrl = url.trim()
        const type = identifyVideoType(cleanUrl)
        const videoId = extractVideoId(cleanUrl, type)
        const thumbnail = getVideoThumbnail(cleanUrl, type, videoId)
        const globalIndex = i + index

        return {
          id: Date.now() + globalIndex,
          title: `${type} - Vídeo ${globalIndex + 1}`,
          url: cleanUrl,
          type: type,
          videoId: videoId,
          thumbnail: thumbnail,
          description: `Vídeo do ${type}`,
          createdAt: new Date().toISOString(),
          status: "Ativo",
        }
      })

      content.videos.push(...newVideos)
      localStorage.setItem("skitbit-content", JSON.stringify(content))
      setRawVideoData([...content.videos])

      const processed = Math.min(i + CHUNK_SIZE, totalUrls)
      setProcessedCount(processed)
      setProcessingProgress((processed / totalUrls) * 100)

      if (i === 0) {
        loadInitialBatch(content.videos)
        window.dispatchEvent(new Event("videosUpdated"))
      }

      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    setIsProcessing(false)
    setIsFileReady(false)
    setUploadedFile([])
    setUploadStatus("success")
    setUploadMessage(`${totalUrls} vídeos processados com sucesso!`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    window.dispatchEvent(new Event("videosUpdated"))
  }

  const handleAddDirectUrl = async () => {
    if (!directUrl.trim()) return

    setIsAddingUrl(true)

    try {
      const cleanUrl = directUrl.trim()
      const type = identifyVideoType(cleanUrl)
      const videoId = extractVideoId(cleanUrl, type)
      const thumbnail = getVideoThumbnail(cleanUrl, type, videoId)

      const newVideo = {
        id: Date.now(),
        title: `${type} - Vídeo ${Date.now()}`,
        url: cleanUrl,
        type: type,
        videoId: videoId,
        thumbnail: thumbnail,
        description: `Vídeo do ${type}`,
        createdAt: new Date().toISOString(),
        status: "Ativo",
      }

      const existingContent = localStorage.getItem("skitbit-content")
      let content = { videos: [] }

      if (existingContent) {
        content = JSON.parse(existingContent)
      }

      if (!content.videos) {
        content.videos = []
      }

      content.videos.unshift(newVideo)
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      setRawVideoData([...content.videos])
      loadInitialBatch(content.videos)
      window.dispatchEvent(new Event("videosUpdated"))

      setDirectUrl("")
      setUploadStatus("success")
      setUploadMessage("Vídeo adicionado com sucesso!")

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao adicionar URL:", error)
      setUploadStatus("error")
      setUploadMessage("Erro ao adicionar vídeo. Verifique a URL.")
    } finally {
      setIsAddingUrl(false)
    }
  }

  const handleVideoSelection = (videoId: number, checked: boolean) => {
    const newSelected = new Set(selectedVideos)
    if (checked) {
      newSelected.add(videoId)
    } else {
      newSelected.delete(videoId)
    }
    setSelectedVideos(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageVideos = displayedVideos.map((video) => video.id)
      const newSelected = new Set([...selectedVideos, ...currentPageVideos])
      setSelectedVideos(newSelected)
    } else {
      const currentPageVideos = new Set(displayedVideos.map((video) => video.id))
      const newSelected = new Set([...selectedVideos].filter((id) => !currentPageVideos.has(id)))
      setSelectedVideos(newSelected)
    }
  }

  const handleRemoveSelected = () => {
    if (selectedVideos.size === 0) return

    const updatedVideos = rawVideoData.filter((video) => !selectedVideos.has(video.id))

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { videos: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.videos = updatedVideos
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("videosUpdated"))

    setRawVideoData(updatedVideos)
    loadInitialBatch(updatedVideos)
    setSelectedVideos(new Set())
  }

  const handleEditVideo = (video: any) => {
    setEditingVideo(video)
    setEditForm({
      title: video.title,
      url: video.url,
      type: video.type,
      description: video.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingVideo) return

    const updatedVideos = rawVideoData.map((video) =>
      video.id === editingVideo.id
        ? {
            ...video,
            title: editForm.title,
            url: editForm.url,
            type: editForm.type,
            description: editForm.description,
          }
        : video,
    )

    const existingContent = localStorage.getItem("skitbit-content")
    let content = { videos: [] }

    if (existingContent) {
      content = JSON.parse(existingContent)
    }

    content.videos = updatedVideos
    localStorage.setItem("skitbit-content", JSON.stringify(content))

    window.dispatchEvent(new Event("videosUpdated"))

    setRawVideoData(updatedVideos)

    setDisplayedVideos((prev) =>
      prev.map((video) => (video.id === editingVideo.id ? { ...video, ...editForm } : video)),
    )

    setEditingVideo(null)
    setIsEditDialogOpen(false)
  }

  const handleCancelEdit = () => {
    setEditingVideo(null)
    setEditForm({
      title: "",
      url: "",
      type: "",
      description: "",
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteAllVideos = async () => {
    if (deletePassword !== "admin123") {
      setDeleteError("Senha incorreta")
      return
    }

    setIsDeleting(true)
    setDeleteError("")

    try {
      const existingContent = localStorage.getItem("skitbit-content")
      let content = { videos: [] }

      if (existingContent) {
        content = JSON.parse(existingContent)
      }

      content.videos = []
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      window.dispatchEvent(new Event("videosUpdated"))

      setRawVideoData([])
      setDisplayedVideos([])
      setSelectedVideos(new Set())
      setCurrentBatch(0)
      setHasMoreVideos(false)
      setAllLoaded(true)
      setShowDeleteDialog(false)
      setDeletePassword("")

      setUploadStatus("success")
      setUploadMessage("Todos os vídeos foram removidos com sucesso!")

      setTimeout(() => {
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao limpar vídeos:", error)
      setDeleteError("Erro ao limpar vídeos")
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
          <Button variant="ghost" className="w-full justify-start bg-neutral-800 text-white">
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
                  placeholder="Buscar vídeos..."
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
            <h1 className="text-3xl font-bold text-white">Controle de Produto</h1>
            <div className="flex items-center gap-3">
              {selectedVideos.size > 0 && (
                <Button variant="destructive" onClick={handleRemoveSelected} className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Selecionados ({selectedVideos.size})
                </Button>
              )}
              {rawVideoData.length > 0 && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                      title="Limpar todos os vídeos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a1a] border-neutral-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">Limpar Todos os Vídeos</AlertDialogTitle>
                      <AlertDialogDescription className="text-neutral-400">
                        Esta ação irá remover permanentemente todos os {rawVideoData.length} vídeos cadastrados. Esta
                        ação não pode ser desfeita.
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
                        onClick={handleDeleteAllVideos}
                        disabled={isDeleting || !deletePassword}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                Novo Vídeo
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
                Cole uma URL de vídeo para adicionar rapidamente à Área de Membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Cole a URL do vídeo aqui..."
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                  disabled={isAddingUrl}
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
                  Suporta: YouTube, Vimeo, Instagram, TikTok, Facebook, X/Twitter - Cole a URL e clique em "Adicionar"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload de URLs de Vídeo (.txt)
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Faça upload de um arquivo .txt com URLs de vídeos (uma por linha) para adicionar à Área de Membros
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
                    Os vídeos estão sendo adicionados gradualmente. Processando 30 URLs a cada 150ms.
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
                  <p>• Cada linha deve conter uma URL de vídeo</p>
                  <p>• Suporta: YouTube, Vimeo, Instagram, TikTok, Facebook, X/Twitter</p>
                  <p>• Exemplo:</p>
                  <div className="bg-neutral-900 p-2 rounded mt-2 font-mono text-xs">
                    <p>https://www.youtube.com/watch?v=exemplo</p>
                    <p>https://vimeo.com/123456789</p>
                    <p>https://www.instagram.com/reel/exemplo</p>
                    <p>https://www.tiktok.com/@user/video/exemplo</p>
                    <p>https://www.facebook.com/watch?v=exemplo</p>
                    <p>https://twitter.com/user/status/exemplo</p>
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
                    <Play className="h-5 w-5" />
                    Lista de Vídeos ({filteredRawVideos.length})
                    {isProcessing && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 ml-2">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Processando...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Gerencie todos os vídeos cadastrados na plataforma
                  </CardDescription>
                </div>
                {displayedVideos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        displayedVideos.every((video) => selectedVideos.has(video.id)) && displayedVideos.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm text-neutral-400">Selecionar todos</Label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredRawVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">Nenhum vídeo encontrado</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {searchTerm ? "Tente ajustar sua busca" : "Faça upload de um arquivo .txt para adicionar vídeos"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedVideos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800/70 transition-colors"
                      >
                        <div className="aspect-[9/16] bg-neutral-700 relative overflow-hidden">
                          <VideoEmbed
                            url={video.url}
                            type={video.type}
                            videoId={video.videoId}
                            title={video.title}
                            className="w-full h-full"
                          />

                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedVideos.has(video.id)}
                              onCheckedChange={(checked) => handleVideoSelection(video.id, checked as boolean)}
                              className="bg-black/50 border-white/50"
                            />
                          </div>

                          <div className="absolute top-2 right-2 flex gap-1 z-10">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 bg-black/50 rounded text-white/70 hover:text-[#C6FF3A] transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVideo(video)}
                              className="p-1 bg-black/50 rounded text-white/70 hover:text-[#C6FF3A] transition-colors h-auto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="absolute bottom-2 left-2 z-10">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${video.type === "YouTube" ? "bg-red-500/80 text-white" : ""}${
                                video.type === "Instagram Reels" ? "bg-pink-500/80 text-white" : ""
                              }${video.type === "TikTok" ? "bg-purple-500/80 text-white" : ""}${
                                video.type === "YouTube Shorts" ? "bg-red-600/80 text-white" : ""
                              }${video.type === "Vimeo" ? "bg-blue-500/80 text-white" : ""}${
                                video.type === "Facebook" ? "bg-green-500/80 text-white" : ""
                              }${video.type === "X/Twitter" ? "bg-yellow-500/80 text-white" : ""}${
                                video.type === "Outro" ? "bg-gray-500/80 text-white" : ""
                              }`}
                            >
                              {video.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3">
                          <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{video.title}</h3>
                          <p className="text-xs text-neutral-400 truncate">{video.url}</p>
                          {video.description && (
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{video.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-[#C6FF3A] mr-2" />
                      <span className="text-neutral-400">Carregando mais vídeos...</span>
                    </div>
                  )}

                  {allLoaded && displayedVideos.length > 0 && (
                    <div className="text-center py-6 border-t border-neutral-800">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-neutral-400 text-sm">Todos os itens foram carregados</span>
                      </div>
                    </div>
                  )}

                  {displayedVideos.length > 0 && (
                    <div className="text-center text-sm text-neutral-500 pt-4">
                      Mostrando {displayedVideos.length} de {filteredRawVideos.length} vídeos
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
            <DialogTitle>Editar Vídeo</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Edite as informações do vídeo selecionado
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
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Input
                id="type"
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
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
