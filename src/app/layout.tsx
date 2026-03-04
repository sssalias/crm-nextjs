import type { Metadata } from "next"
import "./globals.css"
import LayoutClient from "@/components/layout/LayoutClient"

export const metadata: Metadata = {
  title: "CRM System",
  description: "CRM and shift management system",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
