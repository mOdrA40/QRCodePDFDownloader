"use client"

import React, { useState } from "react"
import { Zap, Wifi, Phone, Mail, MapPin, Calendar, Link2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  WiFiModal,
  PhoneModal,
  EmailModal,
  LocationModal,
  EventModal,
  WebsiteModal,
  VCardModal
} from "./quick-action-modals"

interface QuickActionsProps {
  onQuickAction: (text: string) => void
}

type ModalType = "wifi" | "phone" | "email" | "location" | "event" | "website" | "vcard" | null

export function QuickActions({ onQuickAction }: QuickActionsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const quickActions = [
    {
      icon: Wifi,
      label: "WiFi",
      modalType: "wifi" as const,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900"
    },
    {
      icon: Phone,
      label: "Phone",
      modalType: "phone" as const,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900"
    },
    {
      icon: Mail,
      label: "Email",
      modalType: "email" as const,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900"
    },
    {
      icon: MapPin,
      label: "Location",
      modalType: "location" as const,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900"
    },
    {
      icon: Calendar,
      label: "Event",
      modalType: "event" as const,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900"
    },
    {
      icon: Link2,
      label: "Website",
      modalType: "website" as const,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900"
    },
    {
      icon: CreditCard,
      label: "vCard",
      modalType: "vcard" as const,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900"
    }
  ]

  const handleModalClose = () => {
    setActiveModal(null)
  }

  return (
    <>
      <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Generate QR codes for common use cases instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                onClick={() => setActiveModal(action.modalType)}
                className="h-16 flex flex-col gap-1 p-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary/50 group"
              >
                <div className={`p-1 rounded transition-all duration-200 group-hover:scale-110 ${action.bgColor}`}>
                  <action.icon className={`h-4 w-4 transition-colors duration-200 ${action.color}`} />
                </div>
                <span className="text-xs font-medium transition-colors duration-200 group-hover:text-primary">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <WiFiModal
        open={activeModal === "wifi"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <PhoneModal
        open={activeModal === "phone"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <EmailModal
        open={activeModal === "email"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <LocationModal
        open={activeModal === "location"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <EventModal
        open={activeModal === "event"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <WebsiteModal
        open={activeModal === "website"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
      <VCardModal
        open={activeModal === "vcard"}
        onOpenChange={handleModalClose}
        onGenerate={onQuickAction}
      />
    </>
  )
}
