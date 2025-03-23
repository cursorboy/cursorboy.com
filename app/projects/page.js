import Link from "next/link"
import Image from "next/image"
import { Github, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projects } from "@/data/projects"
import { cn } from "@/lib/utils"

export default function ProjectsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          A collection of projects I've worked on, from web applications to experiments with new technologies.
        </p>
      </div>
      <div className="relative mt-12">
        <div className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-border" />
        <div className="space-y-12">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className={`relative flex items-center ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              {/* Date marker - opposite side of the card */}
              <div
                className={cn(
                  "absolute top-0 transform -translate-y-1/2 text-sm text-muted-foreground",
                  i % 2 === 0 ? "left-[calc(50%+2rem)]" : "right-[calc(50%+2rem)]",
                )}
              >
                {project.date}
              </div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary" />

              {/* Project card */}
              <Card className={`w-[calc(50%-2rem)] ${i % 2 === 0 ? "mr-8" : "ml-8"}`}>
                <CardContent className="p-6">
                  <div className="aspect-video relative mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="mt-2 text-muted-foreground">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={project.github}>
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={project.demo}>
                        <Globe className="mr-2 h-4 w-4" />
                        Demo
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

