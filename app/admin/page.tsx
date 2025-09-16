"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Package,
  HelpCircle,
  Eye,
  Save,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Trash2,
  TrendingUp,
  Upload,
  ChevronLeft,
  LogOut,
  Menu,
  Search,
  Store,
  Plus,
  XCircle,
  Edit,
  ExternalLink,
  Activity,
  DollarSign,
  Info,
  Download,
  X,
} from "lucide-react"
import { ShopifyStoreCard } from "@/components/shopify-store-card"

interface ContentData {
  hero: {
    title: string
    subtitle: string
    buttonText: string
  }
  features: {
    title: string
    subtitle: string
  }
  footer: {
    tagline: string
    copyright: string
  }
  about: {
    title: string
    description: string
    mission: string
    vision: string
    teamSize: string
    founded: string
    locations: string
  }
  pricing: {
    startup: {
      price_usd: string
      price_inr: string
      features: string[]
      videos: string[]
    }
    pro: {
      price_usd: string
      price_inr: string
      features: string[]
      videos: string[]
    }
    premium: {
      price_usd: string
      price_inr: string
      features: string[]
      videos: string[]
    }
  }
  orderForm: {
    whatsappNumber: string
    modelingOptions: {
      simple: { price_usd: number; price_inr: number; description: string }
      medium: { price_usd: number; price_inr: number; description: string }
      complex: { price_usd: number; price_inr: number; description: string }
    }
    renderOptions: {
      basic: { price_usd: number; price_inr: number; quantity: number }
      standard: { price_usd: number; price_inr: number; quantity: number }
      premium: { price_usd: number; price_inr: number; quantity: number }
    }
    formSteps: {
      enabled: boolean
      title: string
      description: string
    }[]
  }
  settings: {
    adminEmail: string
    adminPassword: string
  }
  stores: Array<{
    id: number
    name: string
    domain: string
    revenue: string
    monthlyVisitors: string
    conversionRate: string
    topProducts: string[]
    adSpend: string
    roas: string
    category: string
    country: string
    founded: string
    employees: string
    image: string
    status: string
    growth: string
    products?: string
    followers?: string
    trafficRank?: string
  }>
}

interface ActivityItem {
  id: string
  name: string
  status: string
  change: string
  icon: string
  time: string
  timestamp: number
}

const defaultContent: ContentData = {
  hero: {
    title: "HIGH-IMPACT 3D ANIMATION FOR BRANDS",
    subtitle: "Transform your brand with stunning 3D animations that captivate and convert",
    buttonText: "Get Started",
  },
  features: {
    title: "Why Choose Skitbit?",
    subtitle: "Professional 3D animation services that deliver results",
  },
  footer: {
    tagline: "Creating the future of visual storytelling",
    copyright: "© 2024 Skitbit. All rights reserved.",
  },
  about: {
    title: "About Skitbit",
    description: "We are a creative studio specializing in high-quality 3D animation and visual effects.",
    mission: "To bring brands to life through innovative 3D storytelling",
    vision: "To be the leading 3D animation studio globally",
    teamSize: "15+ Professionals",
    founded: "2020",
    locations: "Global Remote Team",
  },
  pricing: {
    startup: {
      price_usd: "$2,999",
      price_inr: "₹2,49,999",
      features: ["Basic 3D Animation", "2 Revisions", "HD Quality", "30-day delivery"],
      videos: ["Product Demo", "Brand Intro"],
    },
    pro: {
      price_usd: "$5,999",
      price_inr: "₹4,99,999",
      features: ["Advanced 3D Animation", "5 Revisions", "4K Quality", "20-day delivery", "Sound Design"],
      videos: ["Product Demo", "Brand Intro", "Social Media Pack"],
    },
    premium: {
      price_usd: "$9,999",
      price_inr: "₹8,49,999",
      features: ["Premium 3D Animation", "Unlimited Revisions", "8K Quality", "15-day delivery", "Full Production"],
      videos: ["Product Demo", "Brand Intro", "Social Media Pack", "TV Commercial"],
    },
  },
  orderForm: {
    whatsappNumber: "+1234567890",
    modelingOptions: {
      simple: { price_usd: 500, price_inr: 41999, description: "Basic 3D model with simple geometry" },
      medium: { price_usd: 1000, price_inr: 83999, description: "Detailed 3D model with textures" },
      complex: { price_usd: 2000, price_inr: 167999, description: "Highly detailed model with advanced materials" },
    },
    renderOptions: {
      basic: { price_usd: 100, price_inr: 8399, quantity: 5 },
      standard: { price_usd: 200, price_inr: 16799, quantity: 10 },
      premium: { price_usd: 400, price_inr: 33599, quantity: 20 },
    },
    formSteps: [
      { enabled: true, title: "Project Details", description: "Tell us about your project" },
      { enabled: true, title: "3D Modeling", description: "Choose your modeling complexity" },
      { enabled: true, title: "Rendering", description: "Select render quality and quantity" },
      { enabled: true, title: "Review & Submit", description: "Review your order and submit" },
    ],
  },
  settings: {
    adminEmail: "admin@skitbit.com",
    adminPassword: "admin123",
  },
  stores: [],
}

// Initial activity data
const initialActivity: ActivityItem[] = [
  {
    id: "1",
    name: "Homepage Content",
    status: "Updated",
    change: "+2.1%",
    icon: "🏠",
    time: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: "2",
    name: "Pricing Plans",
    status: "Modified",
    change: "+1.8%",
    icon: "💰",
    time: "4 hours ago",
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: "3",
    name: "About Page",
    status: "Published",
    change: "+3.2%",
    icon: "ℹ️",
    time: "6 hours ago",
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
  },
  {
    id: "4",
    name: "Footer Content",
    status: "Updated",
    change: "+0.9%",
    icon: "📄",
    time: "8 hours ago",
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
  },
]

const activityData = [
  {
    id: 1,
    type: "upload",
    message: "New store uploaded: techgadgets.com",
    time: "2 min ago",
    icon: Store, // Changed from 🏠 emoji
    color: "text-blue-400",
  },
  {
    id: 2,
    type: "revenue",
    message: "Revenue milestone reached: R$ 1M+",
    time: "1 hour ago",
    icon: DollarSign, // Changed from 💰 emoji
    color: "text-green-400",
  },
  {
    id: 3,
    type: "info",
    message: "System maintenance scheduled",
    time: "3 hours ago",
    icon: Info, // Changed from ℹ️ emoji
    color: "text-yellow-400",
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [selectedPage, setSelectedPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState<ContentData>(defaultContent)
  const [originalContent, setOriginalContent] = useState<ContentData>(defaultContent)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [saveMessage, setSaveMessage] = useState("")
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(initialActivity)
  const [activityPage, setActivityPage] = useState(0)
  const [analyticsData, setAnalyticsData] = useState([
    { metric: "Page Views", value: "12,543", change: "+15.2%", trend: "up" },
    { metric: "Unique Visitors", value: "8,921", change: "+8.7%", trend: "up" },
    { metric: "Bounce Rate", value: "23.4%", change: "-5.1%", trend: "down" },
    { metric: "Avg. Session", value: "3m 42s", change: "+12.3%", trend: "up" },
  ])
  const [videoToAdd, setVideoToAdd] = useState("")
  const [featureToAdd, setFeatureToAdd] = useState("")
  const [currentPricingTier, setCurrentPricingTier] = useState<"startup" | "pro" | "premium">("startup")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCountry, setSelectedCountry] = useState("")

  const sidebarItems = [
    { id: "home", name: "Dashboard", icon: Activity },
    { id: "controle-lojas", name: "Controle de Lojas", icon: Store, href: "/admin/controle-lojas" },
    { id: "controle-produtos", name: "Controle de Produtos", icon: Package, href: "/admin/controle-produtos" },
    { id: "controle-downloads", name: "Controle de Downloads", icon: Download, href: "/admin/controle-downloads" },
  ]

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const cookies = document.cookie.split(";")
      const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("admin-session="))

      if (sessionCookie && sessionCookie.includes("authenticated")) {
        setIsAuthenticated(true)
        // Load saved content from localStorage
        const savedContent = localStorage.getItem("skitbit-content")
        if (savedContent) {
          const parsedContent = JSON.parse(savedContent)
          setContent(parsedContent)
          setOriginalContent(parsedContent)
        }

        // Load saved activity from localStorage
        const savedActivity = localStorage.getItem("skitbit-activity")
        if (savedActivity) {
          setActivityItems(JSON.parse(savedActivity))
        }
      } else {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Check for changes whenever content is updated
  useEffect(() => {
    const hasContentChanged = JSON.stringify(content) !== JSON.stringify(originalContent)
    setHasChanges(hasContentChanged)
  }, [content, originalContent])

  const handleLogout = () => {
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin/login")
  }

  const handleContentChange = (section: keyof ContentData, field: string, value: string | string[]) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handlePricingChange = (tier: "startup" | "pro" | "premium", field: string, value: string | string[]) => {
    setContent((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [tier]: {
          ...prev.pricing[tier],
          [field]: value,
        },
      },
    }))
  }

  const addFeature = (tier: "startup" | "pro" | "premium") => {
    if (featureToAdd.trim()) {
      handlePricingChange(tier, "features", [...content.pricing[tier].features, featureToAdd.trim()])
      setFeatureToAdd("")
    }
  }

  const removeFeature = (tier: "startup" | "pro" | "premium", index: number) => {
    const newFeatures = [...content.pricing[tier].features]
    newFeatures.splice(index, 1)
    handlePricingChange(tier, "features", newFeatures)
  }

  const addVideo = (tier: "startup" | "pro" | "premium") => {
    if (videoToAdd.trim()) {
      // Extract YouTube ID if full URL is pasted
      let videoId = videoToAdd.trim()

      // Handle youtube.com/watch?v= format
      if (videoId.includes("youtube.com/watch?v=")) {
        videoId = videoId.split("v=")[1]?.split("&")[0] || videoId
      }

      // Handle youtu.be/ format
      if (videoId.includes("youtu.be/")) {
        videoId = videoId.split("youtu.be/")[1]?.split("?")[0] || videoId
      }

      handlePricingChange(tier, "videos", [...content.pricing[tier].videos, videoId])
      setVideoToAdd("")
    }
  }

  const removeVideo = (tier: "startup" | "pro" | "premium", index: number) => {
    const newVideos = [...content.pricing[tier].videos]
    newVideos.splice(index, 1)
    handlePricingChange(tier, "videos", newVideos)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage("")

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Save to localStorage
      localStorage.setItem("skitbit-content", JSON.stringify(content))

      // Create a new activity item
      const section = selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        name: `${section} Content`,
        status: "Updated",
        change: `+${(Math.random() * 3 + 0.5).toFixed(1)}%`,
        icon:
          selectedPage === "home"
            ? "🏠"
            : selectedPage === "pricing"
              ? "💰"
              : selectedPage === "content"
                ? "📝"
                : selectedPage === "settings"
                  ? "⚙️"
                  : "📄",
        time: "Just now",
        timestamp: Date.now(),
      }

      const updatedActivity = [newActivity, ...activityItems.slice(0, 9)]
      setActivityItems(updatedActivity)
      localStorage.setItem("skitbit-activity", JSON.stringify(updatedActivity))

      // Update original content to match current content
      setOriginalContent(JSON.parse(JSON.stringify(content)))
      setHasChanges(false)
      setSaveMessage("Changes saved successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage("Error saving changes. Please try again.")
    }

    setIsSaving(false)
  }

  const handlePreview = () => {
    // Open homepage in new tab
    window.open("/", "_blank")
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Simple search functionality
      const sections = ["home", "content", "pricing", "analytics", "settings", "help"]
      const found = sections.find((section) => section.toLowerCase().includes(searchQuery.toLowerCase()))
      if (found) {
        setSelectedPage(found)
        setSearchQuery("")
      }
    }
  }

  const clearNotifications = () => {
    setNotifications(0)
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return `${interval} years ago`

    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return `${interval} months ago`

    interval = Math.floor(seconds / 86400)
    if (interval > 1) return `${interval} days ago`
    if (interval === 1) return `1 day ago`

    interval = Math.floor(seconds / 3600)
    if (interval > 1) return `${interval} hours ago`
    if (interval === 1) return `1 hour ago`

    interval = Math.floor(seconds / 60)
    if (interval > 1) return `${interval} minutes ago`
    if (interval === 1) return `1 minute ago`

    return `Just now`
  }

  // Update activity times
  useEffect(() => {
    const updateTimes = () => {
      setActivityItems((prev) =>
        prev.map((item) => ({
          ...item,
          time: formatTimeAgo(item.timestamp),
        })),
      )
    }

    updateTimes()
    const interval = setInterval(updateTimes, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const navigateActivity = (direction: "prev" | "next") => {
    if (direction === "prev" && activityPage > 0) {
      setActivityPage((prev) => prev - 1)
    } else if (direction === "next" && (activityPage + 1) * 4 < activityItems.length) {
      setActivityPage((prev) => prev + 1)
    }
  }

  const currentActivityItems = activityItems.slice(activityPage * 4, (activityPage + 1) * 4)

  const handleNavigation = (item: any) => {
    if (item.href) {
      router.push(item.href)
    } else {
      setSelectedPage(item.id)
    }
    setSidebarOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C6FF3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
    "Austrália",
    "Japão",
    "Coreia do Sul",
    "China",
    "Índia",
    "Singapura",
    "Holanda",
    "Suécia",
    "Noruega",
    "Dinamarca",
    "Finlândia",
    "Suíça",
    "Áustria",
    "Bélgica",
    "Irlanda",
    "Nova Zelândia",
    "África do Sul",
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedCountry) {
      setUploadMessage("Erro: Por favor, selecione um país antes do upload")
      return
    }

    // Check file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".csv")) {
      setUploadMessage("Erro: Por favor, selecione um arquivo .xlsx ou .csv")
      return
    }

    setIsUploading(true)
    setUploadMessage("")

    try {
      // Import XLSX library dynamically
      const XLSX = await import("xlsx")

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // Get first worksheet
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

          const storeData = jsonData.slice(1).map((row, index) => ({
            id: Date.now() + index,
            name: row[0] ? row[0].replace(/^https?:\/\//, "").replace(/\/$/, "") : `Loja ${index + 1}`,
            domain: row[0] ? row[0].replace(/^https?:\/\//, "").replace(/\/$/, "") : `loja${index + 1}.com`,
            revenue: row[1] || "R$ 0", // Coluna 2: Faturamento
            monthlyVisitors: "0",
            conversionRate: "0%",
            topProducts: [],
            adSpend: "R$ 0",
            roas: "0x",
            category: "E-commerce",
            country: selectedCountry, // Usar o país selecionado
            founded: "2024",
            employees: "1-10",
            image: "",
            status: "active",
            growth: "+0%",
            products: row[2] || "0", // Coluna 3: Produtos
            trafficRank: row[3] || "0", // Coluna 4: Rank de tráfego
          }))

          // Update content with new stores
          setContent((prev) => ({
            ...prev,
            stores: [...prev.stores, ...storeData],
          }))

          setUploadMessage(`Sucesso: ${storeData.length} lojas adicionadas do país ${selectedCountry}!`)

          // Add activity log
          const newActivity: ActivityItem = {
            id: Date.now().toString(),
            name: `${storeData.length} lojas importadas (${selectedCountry})`,
            status: "completed",
            change: `+${storeData.length}`,
            icon: "upload",
            time: "Agora",
            timestamp: Date.now(),
          }

          setActivityItems((prev) => [newActivity, ...prev])
        } catch (error) {
          console.error("[v0] Error processing file:", error)
          setUploadMessage("Erro: Falha ao processar o arquivo")
        } finally {
          setIsUploading(false)
        }
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("[v0] Error uploading file:", error)
      setUploadMessage("Erro: Falha no upload do arquivo")
      setIsUploading(false)
    }

    // Clear file input
    event.target.value = ""
  }

  const handleClearStores = () => {
    setContent((prev) => ({
      ...prev,
      stores: [],
    }))
    setUploadMessage("Todas as lojas foram removidas")
  }

  const renderContent = () => {
    if (selectedPage === "controle-produtos") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Controle de Produtos</h2>
            <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Produtos Cadastrados</CardTitle>
              <CardDescription className="text-neutral-400">Gerencie todos os produtos da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Total de Produtos</p>
                        <p className="text-2xl font-bold text-white">1,247</p>
                      </div>
                      <Package className="h-8 w-8 text-[#C6FF3A]" />
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Produtos Ativos</p>
                        <p className="text-2xl font-bold text-white">1,156</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Produtos Inativos</p>
                        <p className="text-2xl font-bold text-white">91</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-800/50">
                      <tr>
                        <th className="text-left p-4 text-neutral-300">Produto</th>
                        <th className="text-left p-4 text-neutral-300">Categoria</th>
                        <th className="text-left p-4 text-neutral-300">Preço</th>
                        <th className="text-left p-4 text-neutral-300">Status</th>
                        <th className="text-left p-4 text-neutral-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-neutral-800">
                        <td className="p-4 text-white">Produto Exemplo 1</td>
                        <td className="p-4 text-neutral-400">Categoria A</td>
                        <td className="p-4 text-white">R$ 99,90</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Ativo</span>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "controle-lojas") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Controle de Lojas</h2>
            <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Loja
            </Button>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Upload de Lojas (.xlsx)</CardTitle>
              <CardDescription className="text-neutral-400">
                Faça upload de um arquivo .xlsx para adicionar lojas automaticamente à Área de Membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Selecione o País</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
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
                  <label className="block text-sm font-medium text-white mb-2">Arquivo .xlsx</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isUploading || !selectedCountry}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C6FF3A] file:text-black hover:file:bg-[#C6FF3A]/90 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Estrutura do arquivo .xlsx:</h4>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>
                    • <strong>Coluna 1:</strong> Link da loja (ex: https://minhaloja.com)
                  </li>
                  <li>
                    • <strong>Coluna 2:</strong> Faturamento (ex: R$ 50.000)
                  </li>
                  <li>
                    • <strong>Coluna 3:</strong> Produtos (ex: 150)
                  </li>
                  <li>
                    • <strong>Coluna 4:</strong> Rank de tráfego (ex: 25.000)
                  </li>
                </ul>
              </div>

              {uploadMessage && (
                <Alert
                  className={
                    uploadMessage.includes("Sucesso")
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                  }
                >
                  <AlertDescription className={uploadMessage.includes("Sucesso") ? "text-green-400" : "text-red-400"}>
                    {uploadMessage}
                  </AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-[#C6FF3A]">
                  <div className="w-4 h-4 border-2 border-[#C6FF3A] border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando arquivo...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Lojas Cadastradas</CardTitle>
                <CardDescription className="text-neutral-400">
                  {content.stores.length} lojas cadastradas na plataforma
                </CardDescription>
              </div>
              {content.stores.length > 0 && (
                <Button onClick={handleClearStores} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todas
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Total de Lojas</p>
                        <p className="text-2xl font-bold text-white">{content.stores.length}</p>
                      </div>
                      <Store className="h-8 w-8 text-[#C6FF3A]" />
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Países</p>
                        <p className="text-2xl font-bold text-white">
                          {new Set(content.stores.map((store) => store.country)).size}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">Última Atualização</p>
                        <p className="text-sm font-medium text-white">
                          {activityItems.find((item) => item.name.includes("lojas importadas"))?.time || "Nunca"}
                        </p>
                      </div>
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {content.stores.length > 0 ? (
                  <div className="border border-neutral-800 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-800/50 sticky top-0">
                          <tr>
                            <th className="text-left p-4 text-neutral-300">Loja</th>
                            <th className="text-left p-4 text-neutral-300">País</th>
                            <th className="text-left p-4 text-neutral-300">Faturamento</th>
                            <th className="text-left p-4 text-neutral-300">Produtos</th>
                            <th className="text-left p-4 text-neutral-300">Rank Tráfego</th>
                          </tr>
                        </thead>
                        <tbody>
                          {content.stores.map((store) => (
                            <tr key={store.id} className="border-t border-neutral-800">
                              <td className="p-4">
                                <a
                                  href={`https://${store.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#C6FF3A] hover:text-[#C6FF3A]/80 flex items-center gap-1"
                                >
                                  {store.domain}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                                  {store.country}
                                </Badge>
                              </td>
                              <td className="p-4 text-white font-medium">{store.revenue}</td>
                              <td className="p-4 text-neutral-400">{store.products}</td>
                              <td className="p-4 text-neutral-400">{store.trafficRank}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma loja cadastrada ainda.</p>
                    <p className="text-sm">Faça upload de um arquivo .xlsx para começar.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "controle-downloads") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Controle de Downloads</h2>
            <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova URL
            </Button>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Configurações de Downloads</CardTitle>
              <CardDescription className="text-neutral-400">
                Gerencie URLs de downloads disponíveis na área de membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-800/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Upload de URLs</h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "controle-rateio") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Controle de Rateio</h2>
            <Button className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Rateio
            </Button>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Configurações de Rateio</CardTitle>
              <CardDescription className="text-neutral-400">
                Gerencie a distribuição de receitas entre lojas e plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-800/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Rateio Padrão</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Plataforma</span>
                        <span className="text-white font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Loja</span>
                        <span className="text-white font-semibold">85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Receita Total</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Este Mês</span>
                        <span className="text-white font-semibold">R$ 45.230,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Comissão Plataforma</span>
                        <span className="text-[#C6FF3A] font-semibold">R$ 6.784,50</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-800/50">
                      <tr>
                        <th className="text-left p-4 text-neutral-300">Loja</th>
                        <th className="text-left p-4 text-neutral-300">Vendas</th>
                        <th className="text-left p-4 text-neutral-300">Comissão Loja</th>
                        <th className="text-left p-4 text-neutral-300">Comissão Plataforma</th>
                        <th className="text-left p-4 text-neutral-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-neutral-800">
                        <td className="p-4 text-white">Loja Exemplo 1</td>
                        <td className="p-4 text-white">R$ 12.500,00</td>
                        <td className="p-4 text-white">R$ 10.625,00</td>
                        <td className="p-4 text-[#C6FF3A]">R$ 1.875,00</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Pago</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "home") {
      return (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Content Management Active</h3>
                  <p className="text-purple-100">Your website content is live and ready for updates.</p>
                </div>
              </div>
              <Button onClick={handlePreview} className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6">
                Preview Site
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-neutral-400 text-sm">Total Content Sections</p>
                    <p className="text-2xl font-bold text-white">6</p>
                  </div>
                  <Button
                    onClick={() => setSelectedPage("content")}
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                  >
                    Manage content <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-neutral-400 text-sm">Site Performance</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                  </div>
                  <Button
                    onClick={() => setSelectedPage("analytics")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Updates</CardTitle>
                <p className="text-neutral-400 text-sm">Content changes from the last 24 hours</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400"
                  onClick={() => navigateActivity("prev")}
                  disabled={activityPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400"
                  onClick={() => navigateActivity("next")}
                  disabled={(activityPage + 1) * 4 >= activityItems.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentActivityItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-neutral-400 text-sm">
                        {item.status} • {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-semibold">{item.change}</span>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "content") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Content Management</h2>
              <p className="text-neutral-400">Edit your website content and sections</p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Unsaved changes</Badge>
              )}
              <Button
                onClick={handlePreview}
                variant="outline"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-transparent"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {saveMessage && (
            <Alert
              className={`${saveMessage.includes("Error") ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}
            >
              {saveMessage.includes("Error") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          )}

          {uploadMessage && (
            <Alert
              className={`${uploadMessage.includes("Erro") ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}
            >
              {uploadMessage.includes("Erro") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-neutral-900/50 border border-neutral-800">
              <TabsTrigger
                value="hero"
                className="data-[state=active]:bg-[#C6FF3A]/20 data-[state=active]:text-[#C6FF3A]"
              >
                Hero
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-[#C6FF3A]/20 data-[state=active]:text-[#C6FF3A]"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="footer"
                className="data-[state=active]:bg-[#C6FF3A]/20 data-[state=active]:text-[#C6FF3A]"
              >
                Footer
              </TabsTrigger>
              <TabsTrigger
                value="stores"
                className="data-[state=active]:bg-[#C6FF3A]/20 data-[state=active]:text-[#C6FF3A]"
              >
                Lojas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stores" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Upload de Lojas</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Importe lojas através de arquivo .xlsx ou .csv
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Selecione o País</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    >
                      <option value="">Selecione um país...</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Arquivo (.xlsx ou .csv)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading || !selectedCountry}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !selectedCountry}
                        className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90 disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Processando..." : "Selecionar Arquivo"}
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Estrutura esperada: Coluna 1 = Link da loja, Coluna 2 = Faturamento, Coluna 3 = Produtos, Coluna 4
                      = Rank de tráfego
                    </p>
                  </div>

                  {/* Display uploaded stores */}
                  {content.stores.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Lojas Carregadas ({content.stores.length})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.stores.map((store) => (
                          <ShopifyStoreCard key={store.id} store={store} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ... existing TabsContent for hero, features, footer ... */}
            <TabsContent value="hero" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Hero Section</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Edit the main hero section of your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input
                      value={content.hero.title}
                      onChange={(e) => handleContentChange("hero", "title", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Subtitle</label>
                    <input
                      value={content.hero.subtitle}
                      onChange={(e) => handleContentChange("hero", "subtitle", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Button Text</label>
                    <input
                      value={content.hero.buttonText}
                      onChange={(e) => handleContentChange("hero", "buttonText", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Features Section</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Edit the features section of your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input
                      value={content.features.title}
                      onChange={(e) => handleContentChange("features", "title", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Subtitle</label>
                    <input
                      value={content.features.subtitle}
                      onChange={(e) => handleContentChange("features", "subtitle", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="footer" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Footer Section</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Edit the footer section of your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Tagline</label>
                    <input
                      value={content.footer.tagline}
                      onChange={(e) => handleContentChange("footer", "tagline", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Copyright</label>
                    <input
                      value={content.footer.copyright}
                      onChange={(e) => handleContentChange("footer", "copyright", e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )
    }

    if (selectedPage === "pricing") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Pricing Management</h2>
              <p className="text-neutral-400">Manage your pricing tiers and features</p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Unsaved changes</Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {saveMessage && (
            <Alert
              className={`${saveMessage.includes("Error") ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}
            >
              {saveMessage.includes("Error") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(["startup", "pro", "premium"] as const).map((tier) => (
              <Card key={tier} className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white capitalize">{tier} Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-neutral-200 text-sm">USD Price</label>
                      <input
                        value={content.pricing[tier].price_usd}
                        onChange={(e) => handlePricingChange(tier, "price_usd", e.target.value)}
                        className="w-full px-3 py-2 bg-[#0f0f0f] border border-neutral-700 rounded-lg text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-200 text-sm">INR Price</label>
                      <input
                        value={content.pricing[tier].price_inr}
                        onChange={(e) => handlePricingChange(tier, "price_inr", e.target.value)}
                        className="w-full px-3 py-2 bg-[#0f0f0f] border border-neutral-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-neutral-200 text-sm">Features</label>
                    <div className="space-y-2">
                      {content.pricing[tier].features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...content.pricing[tier].features]
                              newFeatures[index] = e.target.value
                              handlePricingChange(tier, "features", newFeatures)
                            }}
                            className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-neutral-700 rounded-lg text-white text-sm"
                          />
                          <Button
                            onClick={() => removeFeature(tier, index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={featureToAdd}
                          onChange={(e) => setFeatureToAdd(e.target.value)}
                          placeholder="Add new feature..."
                          className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-neutral-700 rounded-lg text-white text-sm"
                        />
                        <Button
                          onClick={() => addFeature(tier)}
                          size="sm"
                          className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (selectedPage === "analytics") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-neutral-400">Monitor your website performance and metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.map((metric, index) => (
              <Card key={index} className="bg-[#1a1a1a] border-neutral-800">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-neutral-400 text-sm">{metric.metric}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`} />
                      <span className={`text-sm ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (selectedPage === "orders") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Management</h2>
            <p className="text-neutral-400">View and manage customer orders</p>
          </div>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Orders Yet</h3>
                <p className="text-neutral-400">Orders will appear here when customers place them</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedPage === "settings") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-neutral-400">Manage your account settings and preferences</p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Unsaved changes</Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {saveMessage && (
            <Alert
              className={`${saveMessage.includes("Error") ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}
            >
              {saveMessage.includes("Error") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Admin Account</CardTitle>
              <CardDescription className="text-neutral-400">Manage your admin account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Admin Email</label>
                <input
                  value={content.settings.adminEmail}
                  onChange={(e) => handleContentChange("settings", "adminEmail", e.target.value)}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Admin Password</label>
                <input
                  type="password"
                  value={content.settings.adminPassword}
                  onChange={(e) => handleContentChange("settings", "adminPassword", e.target.value)}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-[#C6FF3A] focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Help & Support</h2>
          <p className="text-neutral-400">Find answers to common questions and get support</p>
        </div>

        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Need Help?</h3>
              <p className="text-neutral-400">Contact our support team for assistance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex">
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
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Skitbit Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:text-[#C6FF3A]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2 p-6">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start ${selectedPage === item.id ? "text-[#C6FF3A]" : "text-neutral-400 hover:text-white"}`}
                onClick={() => handleNavigation(item)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-0">
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
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
                <Input placeholder="Buscar..." className="pl-10 bg-neutral-800 border-neutral-700 text-white w-80" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef}>{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
