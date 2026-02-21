import type { Metadata } from "next"
import "./globals.css"
import LayoutClient from "@/components/layout/LayoutClient"

export const metadata: Metadata = {
  title: "CRM System",
  description: "CRM and shift management system",
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
