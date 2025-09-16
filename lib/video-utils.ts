// Video utility functions for identifying and processing video URLs

export function identifyVideoType(url: string): string {
  if (!url) return "Outro"

  const cleanUrl = url.toLowerCase()

  if (cleanUrl.includes("youtube.com/watch") || cleanUrl.includes("youtu.be/")) {
    if (cleanUrl.includes("/shorts/")) {
      return "YouTube Shorts"
    }
    return "YouTube"
  }

  if (cleanUrl.includes("vimeo.com/")) {
    return "Vimeo"
  }

  if (cleanUrl.includes("instagram.com/reel") || cleanUrl.includes("instagram.com/p/")) {
    return "Instagram Reels"
  }

  if (cleanUrl.includes("tiktok.com/")) {
    return "TikTok"
  }

  if (cleanUrl.includes("facebook.com/watch") || cleanUrl.includes("fb.watch/")) {
    return "Facebook"
  }

  if (cleanUrl.includes("twitter.com/") || cleanUrl.includes("x.com/")) {
    return "X/Twitter"
  }

  return "Outro"
}

export function extractVideoId(url: string, type: string): string {
  if (!url) return ""

  try {
    switch (type) {
      case "YouTube":
      case "YouTube Shorts":
        if (url.includes("youtu.be/")) {
          return url.split("youtu.be/")[1]?.split("?")[0] || ""
        }
        if (url.includes("youtube.com/watch?v=")) {
          return url.split("v=")[1]?.split("&")[0] || ""
        }
        if (url.includes("/shorts/")) {
          return url.split("/shorts/")[1]?.split("?")[0] || ""
        }
        break

      case "Vimeo":
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
        return vimeoMatch ? vimeoMatch[1] : ""

      case "Instagram Reels":
        const instaMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
        return instaMatch ? instaMatch[1] : ""

      case "TikTok":
        const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
        return tiktokMatch ? tiktokMatch[1] : ""

      case "Facebook":
        const fbMatch = url.match(/facebook\.com\/watch\/?\?v=(\d+)/) || url.match(/fb\.watch\/([A-Za-z0-9]+)/)
        return fbMatch ? fbMatch[1] : ""

      case "X/Twitter":
        const twitterMatch = url.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/)
        return twitterMatch ? twitterMatch[1] : ""

      default:
        return ""
    }
  } catch (error) {
    console.error("[v0] Erro ao extrair ID do vídeo:", error)
    return ""
  }

  return ""
}

export function getVideoThumbnail(url: string, type: string, videoId: string): string {
  if (!videoId) return ""

  try {
    switch (type) {
      case "YouTube":
      case "YouTube Shorts":
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

      case "Vimeo":
        // Vimeo thumbnails require API call, using placeholder for now
        return `https://vumbnail.com/${videoId}.jpg`

      case "Instagram Reels":
        // Instagram thumbnails are not easily accessible, using placeholder
        return "/instagram-reel.jpg"

      case "TikTok":
        // TikTok thumbnails are not easily accessible, using placeholder
        return "/tiktok-video.png"

      case "Facebook":
        // Facebook thumbnails are not easily accessible, using placeholder
        return "/facebook-video.jpg"

      case "X/Twitter":
        // Twitter thumbnails are not easily accessible, using placeholder
        return "/twitter-video.jpg"

      default:
        return "/video-thumbnail.png"
    }
  } catch (error) {
    console.error("[v0] Erro ao gerar thumbnail:", error)
    return "/video-thumbnail.png"
  }
}

// Additional utility function to validate video URLs
export function isValidVideoUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false

  const videoPatterns = [
    /youtube\.com\/watch\?v=/,
    /youtu\.be\//,
    /youtube\.com\/shorts\//,
    /vimeo\.com\/\d+/,
    /instagram\.com\/(?:reel|p)\//,
    /tiktok\.com\/@[^/]+\/video\/\d+/,
    /facebook\.com\/watch/,
    /fb\.watch\//,
    /(?:twitter|x)\.com\/[^/]+\/status\/\d+/,
  ]

  return videoPatterns.some((pattern) => pattern.test(url))
}

// Function to format video duration (if available)
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "00:00"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}
