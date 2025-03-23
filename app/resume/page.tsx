import Link from "next/link"
import { Mail, Linkedin, Globe, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResumePage() {
  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Jash-Piam Parekh</h1>
          <div className="mt-2 flex flex-wrap gap-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-1 h-4 w-4" />
              <span>piamparekh17@gmail.com</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-1 h-4 w-4" />
              <span>(510)-509-8139</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Linkedin className="mr-1 h-4 w-4" />
              <Link href="https://linkedin.com/in/piamparekh" className="hover:underline">
                linkedin.com/in/piamparekh
              </Link>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="mr-1 h-4 w-4" />
              <Link href="https://cursorboy.com" className="hover:underline">
                cursorboy.com
              </Link>
            </div>
          </div>
        </div>
        <Button>Download Resume</Button>
      </div>

      {/* Education Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">The University of California - Santa Barbara</h3>
                <span className="text-sm text-muted-foreground">Spring 2027</span>
              </div>
              <p>B.S. in Mathematics, minoring in Statistical Sciences</p>
              <p className="text-sm text-muted-foreground">GPA: 3.78/4.0</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Relevant Courses:</span> Machine Learning, Data Structures, Advanced
                Language Systems and Theory, Object-Oriented Programming
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Software Engineering Intern | NeuraNiche | San Jose, CA</h3>
                <span className="text-sm text-muted-foreground">Jun. 2024 - Aug. 2024</span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>Enhanced knowledge retrieval using GraphRAG, increasing query resolution speed by 45%</li>
                <li>
                  Integrated LLM software to auto-generate neural network insights, improving report generation
                  efficiency by 60%
                </li>
                <li>
                  Optimized a hybrid architecture using GraphRAG and LLM, leading to a 50% reduction in computational
                  cost
                </li>
                <li>
                  Fine-tuned company LLM models for industry-specific tasks, achieving a 35% improvement in prediction
                  accuracy
                </li>
              </ul>
            </div>

            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Software Engineering Intern | Z-Scalar | Remote</h3>
                <span className="text-sm text-muted-foreground">Jun. 2023 - Sep. 2023</span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>
                  Created an application to iterate through company servers for leaked SSH keys and private information
                </li>
                <li>It Scanned Slack Channels, DEVOX code, and GitHub for hard coded information</li>
                <li>Optimized run-time performance for key finder app by 21%, allowing for quicker safety alerts</li>
                <li>Developed a Slack Bot using Slack API for real-time reports, improving response times by 34%</li>
              </ul>
            </div>

            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Computer Science Tutor | KidzToPros | San Jose, CA</h3>
                <span className="text-sm text-muted-foreground">Aug. 2022 - Jun. 2023</span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>
                  Taught Lua, Python, and C# programming to over 10 students simultaneously in live virtual sessions
                </li>
                <li>
                  Designed and led hands-on projects involving Arduino and robotics to teach core CS concepts like
                  loops, conditionals, and hardware integration
                </li>
                <li>
                  Developed tailored lesson plans for students of varying skill levels, focusing on problem-solving, and
                  logical thinking
                </li>
                <li>
                  Fostered collaborative learning environments where students built games, automated systems, and
                  interactive devices
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Founder and Developer | CyberSimLab.com</h3>
                <span className="text-sm text-muted-foreground">Mar. 2025 - Present</span>
              </div>
              <span className="text-xs text-muted-foreground">In Progress</span>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>
                  Built the platform using React, Node.js, and Docker with a scalable backend architecture designed to
                  support thousands of concurrent learners
                </li>
                <li>
                  Developed a simulation tool enabling users to counteract real time threats like DDos and phishing in a
                  virtual environment. (average response time of 200ms for user-interactions)
                </li>
                <li>
                  Employed dimension reduction and random undersampling techniques to improve model performance by +10%
                </li>
              </ul>
            </div>

            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Sleep Camera Vision System | Personal Project</h3>
                <span className="text-sm text-muted-foreground">Dec. 2024</span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>
                  Designed a system integrating Apple Watch heart data and real-time video analysis to monitor sleep
                  patterns
                </li>
                <li>Built a pipeline to synchronize heart rate and camera data for comprehensive sleep tracking</li>
                <li>
                  Integrated an LLM to provide direct feedback on sleep quality by comparing data with scientific
                  research
                </li>
              </ul>
            </div>

            <div>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <h3 className="font-semibold">Lunch-Time Web App | Competition Project</h3>
                <span className="text-sm text-muted-foreground">Dec. 2024</span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>
                  Created a web app using React and JavaScript to track dining hall occupancy using PyTorch and YOLO
                  (You Only Look Once) for AI-based camera tracking
                </li>
                <li>Used OpenCV for image processing and integrated with public APIs for real-time data</li>
                <li>Optimized response time by 90%, updating every 0.5ms</li>
                <li>Won 2nd place in our school's Data Science Project competition</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Skills Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Technical Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Languages</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["C", "Java", "JavaScript", "Python", "R", "Scala", "SQL", "Swift UI"].map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium">Technologies</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Docker", "Flask", "Git", "Node.js", "PyTorch", "React.js", "REST APIs", "AWS"].map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium">Certifications</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Eagle Scout", "Red Cross CPR certified", "AWS AI Practitioner"].map((cert) => (
                  <Badge key={cert} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Chess", "Rock Climbing", "Cooking", "Backpacking"].map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

