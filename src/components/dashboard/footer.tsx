import React from 'react'

interface FooterProps {
  platformName?: string
}

export function Footer({ platformName }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const name = platformName || 'SinChew Demo'

  return (
    <footer className="w-full border-t bg-white py-4 text-center text-sm text-muted-foreground dark:bg-gray-950 dark:border-gray-800">
      <p>
        &copy; {currentYear} {name}. All rights reserved.
      </p>
    </footer>
  )
}
