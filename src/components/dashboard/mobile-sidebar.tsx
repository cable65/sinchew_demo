'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/dashboard/sidebar'
import { cn } from '@/lib/utils'

interface MobileSidebarProps {
  platformName?: string
}

export function MobileSidebar({ platformName }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)} 
        aria-label="Open Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Container */}
          <div className="relative flex h-full w-64 flex-col bg-white shadow-xl transition-transform dark:bg-gray-950">
            <div className="absolute right-2 top-2 z-50">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Sidebar platformName={platformName} className="w-full border-none" />
          </div>
        </div>
      )}
    </div>
  )
}
