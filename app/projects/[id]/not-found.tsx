import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProjectNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold">Project Not Found</h1>
      <p className="mt-4 text-muted-foreground">The project you're looking for doesn't exist or has been removed.</p>
      <Button asChild className="mt-8">
        <Link href="/projects">Return to Projects</Link>
      </Button>
    </div>
  )
}

