import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { projects } from "@/data/projects"

export default function ProjectsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-6 text-center mb-12">
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A collection of projects I've worked on, from web applications to experiments with new technologies.
        </p>
      </div>

      {/* Timeline container with max width for better spacing */}
      <div className="relative mt-16 max-w-4xl mx-auto px-8">
        {/* Vertical line */}
        <div className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-gradient-to-b from-purple-400 to-cyan-400" />

        {/* Projects */}
        <div className="space-y-24">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className={`relative flex items-center ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              {/* Date marker */}
              <div
                className={cn(
                  "absolute top-0 -translate-y-1/2 font-medium text-sm bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent",
                  i % 2 === 0 ? "left-[calc(50%+1.5rem)]" : "right-[calc(50%+1.5rem)]",
                )}
              >
                {project.date}
              </div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-background bg-gradient-to-r from-purple-400 to-cyan-400 z-10" />

              {/* Project card - now wrapped in Link */}
              <Link
                href={`/projects/${project.id}`}
                className={`block w-[calc(50%-3rem)] ${i % 2 === 0 ? "mr-12" : "ml-12"} transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1`}
              >
                <Card className="h-full overflow-hidden border-none shadow-lg bg-background/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      {project.inProgress && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-none">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{project.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-background/50 backdrop-blur">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent inline-block">
                      View project details →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

