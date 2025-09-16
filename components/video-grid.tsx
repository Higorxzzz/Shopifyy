"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ExternalLink, Youtube, Instagram, Loader2 } from "lucide-react"
import { VideoEmbed } from "./video-embed"

interface VideoData {
  title: string
  url: string
  type: string
  thumbnail?: string
  description: string
  createdAt: string
  status: string
}

interface Video extends VideoData {
  id: number
  videoId?: string
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const extractVideoId = (url: string, type: string): string | null => {
  if (type === "YouTube") {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  if (type === "Instagram Reels") {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/)
    return match ? match[1] : null
  }

  if (type === "TikTok") {
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
    return match ? match[1] : null
  }

  return null
}

const getPlatformIcon = (type: string) => {
  switch (type) {
    case "YouTube":
    case "YouTube Shorts":
      return <Youtube className="h-4 w-4" />
    case "Instagram":
    case "Instagram Reels":
      return <Instagram className="h-4 w-4" />
    case "TikTok":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
        </svg>
      )
    case "Vimeo":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
        </svg>
      )
    case "Facebook":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case "X/Twitter":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308L7.084 4.126H5.117z" />
        </svg>
      )
    default:
      return <Play className="h-4 w-4" />
  }
}

export function VideoGrid() {
  const [rawVideoData, setRawVideoData] = useState<VideoData[]>([])
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreVideos, setHasMoreVideos] = useState(true)
  const [shuffledVideoData, setShuffledVideoData] = useState<VideoData[]>([])

  const VIDEOS_PER_PAGE = 8

  const createVideoObject = useCallback((videoData: VideoData, index: number): Video => {
    return {
      id: index + 1,
      ...videoData,
      videoId: extractVideoId(videoData.url, videoData.type),
    }
  }, [])

  useEffect(() => {
    const loadVideoData = () => {
      const existingContent = localStorage.getItem("skitbit-content")
      if (existingContent) {
        const content = JSON.parse(existingContent)
        if (content.videos && Array.isArray(content.videos)) {
          setRawVideoData(content.videos)
          const shuffledVideos = shuffleArray(content.videos)
          setShuffledVideoData(shuffledVideos)

          const initialVideos = shuffledVideos
            .slice(0, VIDEOS_PER_PAGE)
            .map((videoData: VideoData, index: number) => createVideoObject(videoData, index))

          setDisplayedVideos(initialVideos)
          setCurrentPage(1)
          setHasMoreVideos(shuffledVideos.length > VIDEOS_PER_PAGE)
        }
      }
    }

    loadVideoData()

    const handleVideosUpdate = () => {
      loadVideoData()
    }

    window.addEventListener("videosUpdated", handleVideosUpdate)
    return () => window.removeEventListener("videosUpdated", handleVideosUpdate)
  }, [createVideoObject])

  const loadMoreVideos = useCallback(() => {
    if (isLoading || !hasMoreVideos) return

    setIsLoading(true)

    setTimeout(() => {
      const startIndex = currentPage * VIDEOS_PER_PAGE
      const endIndex = startIndex + VIDEOS_PER_PAGE
      const nextVideos = shuffledVideoData
        .slice(startIndex, endIndex)
        .map((videoData, index) => createVideoObject(videoData, startIndex + index))

      if (nextVideos.length > 0) {
        setDisplayedVideos((prev) => [...prev, ...nextVideos])
        setCurrentPage((prev) => prev + 1)
      }

      setHasMoreVideos(endIndex < shuffledVideoData.length)
      setIsLoading(false)
    }, 300)
  }, [currentPage, shuffledVideoData, isLoading, hasMoreVideos, createVideoObject])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
          loadMoreVideos()
        }
      }, 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [loadMoreVideos])

  const memoizedVideos = useMemo(() => displayedVideos, [displayedVideos])

  if (rawVideoData.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum vídeo disponível</h3>
        <p className="text-neutral-400">Os vídeos aparecerão aqui quando forem adicionados pelo administrador.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {memoizedVideos.map((video) => (
          <Card
            key={video.id}
            className="bg-[#1a1a1a] border-neutral-800 hover:border-[#C6FF3A]/30 transition-colors overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="space-y-3">
                <VideoEmbed
                  url={video.url}
                  type={video.type}
                  videoId={video.videoId}
                  title={video.title}
                  className="w-full"
                />

                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-2">{video.title}</h3>

                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={`flex items-center gap-1 text-xs ${
                        video.type === "YouTube" || video.type === "YouTube Shorts" ? "bg-red-500/20 text-red-400" : ""
                      }${video.type === "Instagram Reels" || video.type === "Instagram" ? "bg-pink-500/20 text-pink-400" : ""}${
                        video.type === "TikTok" ? "bg-purple-500/20 text-purple-400" : ""
                      }${video.type === "Vimeo" ? "bg-blue-500/20 text-blue-400" : ""}${
                        video.type === "Facebook" ? "bg-blue-600/20 text-blue-300" : ""
                      }${video.type === "X/Twitter" ? "bg-gray-500/20 text-gray-400" : ""}${
                        video.type === "Outro" ? "bg-gray-500/20 text-gray-400" : ""
                      }`}
                    >
                      {getPlatformIcon(video.type)}
                      {video.type}
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2">{video.description}</p>

                  <Button
                    size="sm"
                    className="w-full bg-[#C6FF3A] text-black hover:bg-[#C6FF3A]/90"
                    onClick={() => window.open(video.url, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Original
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando mais vídeos...</span>
          </div>
        </div>
      )}

      {!hasMoreVideos && displayedVideos.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-full text-neutral-400">
            <Play className="h-4 w-4" />
            <span>Todos os vídeos foram carregados</span>
          </div>
        </div>
      )}
    </div>
  )
}
