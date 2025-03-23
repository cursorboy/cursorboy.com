"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User2, Code2, Mail, Menu, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: User2 },
  { href: "/projects", label: "Projects", icon: Code2 },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/contact", label: "Contact", icon: Mail },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-6 md:px-10">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <span className="font-bold text-xl">JP</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center space-x-8 text-sm font-medium">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === href ? "text-foreground" : "text-foreground/60",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <nav className="grid gap-6 text-lg font-medium">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

