// src/hooks/useSidebar.ts
import { useState, useEffect } from "react"

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return {
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(prev => !prev)
  }
}