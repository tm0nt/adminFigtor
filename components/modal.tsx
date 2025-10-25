// components/modal.tsx
"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto animate-fade-in">
      <div className="absolute inset-0" onClick={handleBackdropClick} />
      <div
        className={`relative bg-[#0f0f0f] rounded-3xl border border-[#1a1a1a] animate-scale-in ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#666666] hover:text-[#ffffff] transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
