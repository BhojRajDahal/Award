"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { itemsFromPagedApiResponse } from "@/lib/paged-api-response"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { Navbar } from "@/components/ui/navbar"

interface GalleryItem {
  gallery_id: number
  name: string
  award: string
  photo: string
  year: number
  created_at: string
}

export default function PastPrizeHistoryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get("/api/gallery/public?limit=100&page=1")

      setGalleryItems(itemsFromPagedApiResponse<GalleryItem>(response.data))
    } catch (err: any) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error("Gallery fetch error:", err)
      }
      // Gracefully handle error - set empty array so UI shows "No gallery items available"
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }

  const getFileUrl = (filePath: string) => {
    if (!filePath) return ""
    const cleanPath = filePath.replace(/^public\//, "")
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL
    if (rawBase && rawBase.includes("http")) {
      return `${rawBase}/api/files/${cleanPath}`
    }
    return `/api/files/${cleanPath}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Past Prize History</h1>
          <p className="text-muted-foreground">Gallery of past prize winners and award recipients</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading gallery items...</span>
          </div>
        ) : galleryItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No gallery items available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((item) => (
              <Card key={item.gallery_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-muted">
                  {item.photo ? (
                    <Image
                      src={getFileUrl(item.photo)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Award: {item.award}</p>
                  <p className="text-sm text-muted-foreground">Year: {item.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
