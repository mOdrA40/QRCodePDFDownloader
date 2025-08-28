"use client"

import React from "react"
import { Share2, Mail, MessageCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface ShareOptionsProps {
  qrDataUrl: string
  qrText: string
}

export function ShareOptions({ qrDataUrl, qrText }: ShareOptionsProps) {
  const shareToEmail = () => {
    const subject = "QR Code Generated"
    const body = `Check out this QR code I generated! It contains: ${qrText}\n\nGenerated with QR PDF Generator`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    toast.success("Email client opened!")
  }

  const shareToWhatsApp = () => {
    const text = `Check out this QR code I generated! It contains: ${qrText}\n\nGenerated with QR PDF Generator`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
    toast.success("WhatsApp opened!")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrText)
      toast.success("QR code content copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const shareViaWebAPI = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "QR Code Generated",
          text: `Check out this QR code: ${qrText}`,
          url: window.location.href,
        })
        toast.success("Shared successfully!")
      } catch (err) {
        toast.error("Sharing cancelled")
      }
    } else {
      toast.error("Web Share API not supported")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={!qrDataUrl}>
          <Share2 className="h-4 w-4 mr-2" />
          Share QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share QR Code</DialogTitle>
          <DialogDescription>
            Share your QR code with others through various platforms
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Button onClick={shareToEmail} variant="outline" className="justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </Button>
          
          <Button onClick={shareToWhatsApp} variant="outline" className="justify-start">
            <MessageCircle className="h-4 w-4 mr-2" />
            Share to WhatsApp
          </Button>
          
          <Button onClick={copyToClipboard} variant="outline" className="justify-start">
            <Copy className="h-4 w-4 mr-2" />
            Copy Content
          </Button>
          
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button onClick={shareViaWebAPI} variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Share via System
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
