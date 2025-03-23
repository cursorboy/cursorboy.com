import Image from "next/image"
import Link from "next/link"
import { Download, Github, Linkedin, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const skills = [
  { name: "React", level: 90 },
  { name: "JavaScript", level: 85 },
  { name: "TypeScript", level: 80 },
  { name: "Node.js", level: 75 },
  { name: "Python", level: 85 },
  { name: "CSS/Tailwind", level: 90 },
]

const experiences = [
  {
    title: "Software Engineering Intern",
    company: "NeuraNiche",
    period: "2023 - Present",
    description: "Working on web development projects and contributing to open source.",
  },
  {
    title: "Mathematics Student",
    company: "University of California, Santa Barbara",
    period: "2022 - Present",
    description: "Pursuing BS in Mathematics with focus on Computer Science.",
  },
]

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">About Me</h1>
            <p className="text-xl text-muted-foreground">Software Developer & Mathematics Student</p>
          </div>

          <div className="relative overflow-hidden rounded-xl border shadow-lg" style={{ height: "500px" }}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5523.jpg-m4Gzm5UZdLeSLwjAS3JQhiGUrFaqal.jpeg"
              alt="Jash-Piam Parekh"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hi, I'm Piam Parekh. I'm a Software Developer and a second year student pursuing BS in Mathematics at
              University of California, Santa Barbara.
            </p>
            <p className="text-muted-foreground">
              I grew up in the Bay Area and have been programming since I was 10 years old. I have experience in web
              development and have worked on projects using a variety of languages.
            </p>
            <p className="text-muted-foreground">
              Apart from coding, I love to climb, play chess for my school team, workout, and go hiking.
            </p>
          </div>

          <div className="flex gap-4">
            <Button asChild>
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Contact Me
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com/cursorboy" target="_blank">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://linkedin.com/in/piamparekh" target="_blank">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column - Skills & Experience */}
        <div className="space-y-8">
          {/* Skills Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Skills</h2>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Experience</h2>
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index} className="relative pl-6 pb-6 last:pb-0">
                    <div className="absolute left-0 top-0 h-full w-px bg-border">
                      <div className="absolute top-2 -left-1 h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">{exp.period}</p>
                      <p className="text-sm">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

