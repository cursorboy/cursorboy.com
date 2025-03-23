import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Github, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProjectPage({
  params,
}: {
  params: { slug: string }
}) {
  // In a real app, you would fetch this data from an API or CMS
  const project = {
    title: "Levels",
    description: "A website for a local gym to help with their sales...",
    content: `
      ## Overview

      This project was built to help a local gym increase their online presence and streamline their sales process. Through this project, I gained valuable experience with React and Next.js, while also learning about deployment on Vercel.

      ## Features

      - Responsive design
      - Membership management
      - Contact form integration
      - Class scheduling system

      ## Technical Details

      The application was built using:
      - React for the UI
      - Next.js for server-side rendering
      - Tailwind CSS for styling
      - Vercel for deployment
    `,
    image: "/placeholder.svg",
    tags: ["React", "Next.js", "Tailwind CSS"],
    github: "#",
    demo: "#",
  }

  return (
    <article className="container py-12">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{project.title}</h1>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-xl text-muted-foreground">{project.description}</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href={project.demo}>
              <Globe className="mr-2 h-4 w-4" />
              View Demo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={project.github}>
              <Github className="mr-2 h-4 w-4" />
              View Code
            </Link>
          </Button>
        </div>
      </div>
      <div className="my-8 aspect-video relative overflow-hidden rounded-lg">
        <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
      </div>
      <div className="prose prose-gray max-w-none dark:prose-invert">{project.content}</div>
    </article>
  )
}

