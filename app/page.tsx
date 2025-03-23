import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projects } from "@/data/projects"

export default function Home() {
  // Get the latest 3 projects
  const featuredProjects = projects.slice(0, 3)

  return (
    <div className="flex flex-col gap-12 pb-8 pt-6 md:py-10">
      <section className="container flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          Hey, I'm{" "}
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Jash-Piam</span>
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Software Developer and Mathematics Student at UCSB. Marvel enthusiast and passionate about creating impactful
          web experiences.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/projects">
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      <section className="container space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Projects</h2>
          <Button variant="ghost" asChild>
            <Link href="/projects">View all projects</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full overflow-hidden border-none shadow-lg bg-background/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
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
                    {project.tags.slice(0, 3).map((tag) => (
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
          ))}
        </div>
      </section>
    </div>
  )
}

