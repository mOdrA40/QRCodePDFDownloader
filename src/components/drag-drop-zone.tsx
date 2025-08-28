"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Upload, FileText, Image as ImageIcon, Link } from "lucide-react"
import { toast } from "sonner"

interface DragDropZoneProps {
  onTextExtracted: (text: string) => void
  className?: string
}

export function DragDropZone({ onTextExtracted, className }: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const extractTextFromFile = useCallback(async (file: File) => {
    const fileType = file.type

    try {
      if (fileType.startsWith('text/')) {
        // Handle text files
        const text = await file.text()
        onTextExtracted(text)
        toast.success(`Text extracted from ${file.name}`)
      } else if (fileType === 'application/json') {
        // Handle JSON files
        const text = await file.text()
        try {
          const json = JSON.parse(text)
          onTextExtracted(JSON.stringify(json, null, 2))
          toast.success(`JSON content extracted from ${file.name}`)
        } catch {
          onTextExtracted(text)
          toast.success(`Raw content extracted from ${file.name}`)
        }
      } else if (fileType.startsWith('image/')) {
        // For images, just use the file name and type info
        onTextExtracted(`Image file: ${file.name} (${file.type})`)
        toast.success(`Image file info extracted: ${file.name}`)
      } else {
        // For other files, use file info
        onTextExtracted(`File: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`)
        toast.success(`File info extracted: ${file.name}`)
      }
    } catch (error) {
      toast.error(`Failed to process file: ${file.name}`)
      console.error('File processing error:', error)
    }
  }, [onTextExtracted])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    
    if (files.length === 0) {
      // Check for text content
      const text = e.dataTransfer.getData('text/plain')
      if (text) {
        onTextExtracted(text)
        toast.success('Text content added!')
        return
      }
    }

    if (files.length > 1) {
      toast.error('Please drop only one file at a time')
      return
    }

    const file = files[0]
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size too large. Please use files smaller than 10MB')
      return
    }

    await extractTextFromFile(file)
  }, [extractTextFromFile, onTextExtracted])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }
        ${className}
      `}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`p-3 rounded-full ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
          <Upload className={`h-6 w-6 ${isDragOver ? 'text-blue-600' : 'text-slate-500'}`} />
        </div>
        
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {isDragOver ? 'Drop your file here' : 'Drag & drop a file'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Support text, JSON, and other files up to 10MB
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Text</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            <span>URLs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
