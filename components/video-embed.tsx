"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink } from "lucide-react"

interface VideoEmbedProps {
  url: string
  type: string
  videoId?: string | null
  title: string
  className?: string
}

const renderFallback = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <ExternalLink className="text-gray-500" />
    </div>
  )
}

export function VideoEmbed({ url, type, videoId, title, className = "" }: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const detectPlatformAndId = (videoUrl: string) => {
    // YouTube
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const youtubeMatch = videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      )
      return {
        platform: videoUrl.includes("/shorts/") ? "YouTube Shorts" : "YouTube",
        id: youtubeMatch ? youtubeMatch[1] : null,
      }
    }

    // Vimeo
    if (videoUrl.includes("vimeo.com")) {
      const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      return {
        platform: "Vimeo",
        id: vimeoMatch ? vimeoMatch[1] : null,
      }
    }

    // Instagram - melhorada detecção para /reel/ e /reels/
    if (videoUrl.includes("instagram.com") || videoUrl.includes("instagr.am")) {
      const instagramMatch = videoUrl.match(/instagram\.com\/(?:p|reel|reels)\/([^/?]+)/)
      const isReel = videoUrl.includes("/reel/") || videoUrl.includes("/reels/")
      return {
        platform: isReel ? "Instagram Reels" : "Instagram",
        id: instagramMatch ? instagramMatch[1] : null,
        fullUrl: videoUrl,
      }
    }

    // TikTok - melhorada detecção
    if (videoUrl.includes("tiktok.com")) {
      const tiktokMatch =
        videoUrl.match(/tiktok\.com\/.*\/video\/(\d+)/) || videoUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
      return {
        platform: "TikTok",
        id: tiktokMatch ? tiktokMatch[1] : null,
        fullUrl: videoUrl,
      }
    }

    // Facebook - melhorada detecção para reels
    if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch")) {
      const isReel = videoUrl.includes("/reel/")
      return {
        platform: isReel ? "Facebook Reels" : "Facebook",
        id: null,
        fullUrl: videoUrl,
      }
    }

    // X/Twitter
    if (videoUrl.includes("twitter.com") || videoUrl.includes("x.com") || videoUrl.includes("t.co")) {
      return {
        platform: "X/Twitter",
        id: null,
        fullUrl: videoUrl,
      }
    }

    return {
      platform: type || "Outro",
      id: videoId,
    }
  }

  const { platform, id, fullUrl } = detectPlatformAndId(url)

  useEffect(() => {
    setIsLoaded(true)
  }, [platform])

  const getAspectRatio = () => {
    return "aspect-[9/16]" // Formato vertical para todos os vídeos
  }

  const renderEmbed = () => {
    switch (platform) {
      case "YouTube":
      case "YouTube Shorts":
        if (!id) return renderFallback()
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1&controls=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      case "Vimeo":
        if (!id) return renderFallback()
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0&controls=1`}
            title={title}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      case "Instagram":
      case "Instagram Reels":
        if (!id) return renderFallback()
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.instagram.com/p/${id}/embed/`}
            title={title}
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      case "TikTok":
        if (!id) return renderFallback()
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.tiktok.com/embed/v2/${id}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      case "Facebook":
      case "Facebook Reels":
        if (!fullUrl) return renderFallback()
        const encodedUrl = encodeURIComponent(fullUrl)
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.facebook.com/plugins/video.php?height=476&href=${encodedUrl}&show_text=false&width=267&t=0`}
            title={title}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      case "X/Twitter":
        if (!fullUrl) return renderFallback()
        const tweetId = fullUrl.match(/status\/(\d+)/)?.[1]
        if (!tweetId) return renderFallback()
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://twitframe.com/show?url=${encodeURIComponent(fullUrl)}`}
            title={title}
            frameBorder="0"
            className="rounded-lg w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        )

      default:
        return renderFallback()
    }
  }

  return (
    <div ref={containerRef} className={`${className} ${getAspectRatio()}`}>
      {renderEmbed()}
    </div>
  )
}
