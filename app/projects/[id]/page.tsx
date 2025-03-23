import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Github, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { projects } from "@/data/projects"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  // Convert markdown-like content to JSX
  const renderDescription = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim() !== "")

    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="mt-8 mb-4 text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {line.replace("## ", "")}
          </h2>
        )
      }

      // Lists
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 list-disc my-1 text-muted-foreground">
            {line.replace("- ", "")}
          </li>
        )
      }

      // Regular paragraphs
      return (
        <p key={index} className="my-4 text-muted-foreground">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="mb-8 group">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>
      </Button>

      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">{project.title}</h1>
              {project.inProgress && (
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-none">
                  In Progress
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{project.date}</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-background/50 backdrop-blur">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-lg">{project.description}</p>
          </div>

          <div className="mt-8 flex gap-4">
            {project.demo && (
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 border-none"
              >
                <Link href={project.demo} target="_blank">
                  <Globe className="mr-2 h-4 w-4" />
                  View Demo
                </Link>
              </Button>
            )}
            {project.github && (
              <Button variant="outline" asChild>
                <Link href={project.github} target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  View Code
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="aspect-video relative overflow-hidden rounded-xl shadow-xl">
          <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
        </div>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
          {renderDescription(project.fullDescription)}
        </div>
      </div>
    </div>
  )
}

