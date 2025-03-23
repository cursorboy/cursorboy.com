export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6">
      <div className="container flex items-center justify-between text-sm text-muted-foreground px-6 md:px-10">
        <p>&copy; {new Date().getFullYear()} Jash-Piam Parekh. All rights reserved.</p>
        <p>Made with ❤️ using Next.js</p>
      </div>
    </footer>
  )
}

