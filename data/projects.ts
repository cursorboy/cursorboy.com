export interface Project {
  id: string
  title: string
  description: string
  fullDescription: string
  date: string
  image: string
  tags: string[]
  github?: string
  demo?: string
  inProgress?: boolean
}

export const projects: Project[] = [
  {
    id: "cybersimlab",
    title: "CyberSimLab.com",
    description: "A platform for learning cybersecurity through interactive simulations of real-time threats.",
    fullDescription: `
      ## Overview
      
      CyberSimLab is a comprehensive platform built to provide hands-on cybersecurity training through realistic simulations. The platform allows users to practice defending against real-time threats like DDoS attacks and phishing attempts in a controlled virtual environment.
      
      ## Features
      
      - Interactive simulations of various cybersecurity threats
      - Real-time attack scenarios with configurable difficulty levels
      - Comprehensive analytics and performance tracking
      - Scalable architecture supporting thousands of concurrent users
      - Average response time of 200ms for user interactions
      
      ## Technologies Used
      
      The platform was built using React for the frontend, Node.js for the backend, and Docker for containerization. The architecture was designed to be highly scalable to support thousands of concurrent learners.
      
      ## Results
      
      - Successfully implemented dimension reduction and random undersampling techniques
      - Improved model performance by +10%
      - Created a responsive and intuitive user interface for complex security concepts
    `,
    date: "March 2025",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["React", "Node.js", "Docker", "Cybersecurity"],
    github: "#",
    demo: "https://cybersimlab.com",
    inProgress: true,
  },
  {
    id: "sleep-camera",
    title: "Sleep Camera Vision System",
    description: "A system integrating Apple Watch heart data and real-time video analysis to monitor sleep patterns.",
    fullDescription: `
      ## Overview
      
      The Sleep Camera Vision System is a personal project designed to provide comprehensive sleep tracking by combining wearable data with computer vision. The system synchronizes heart rate data from an Apple Watch with real-time video analysis to monitor sleep patterns and provide insights.
      
      ## Features
      
      - Integration of Apple Watch heart rate data
      - Real-time video analysis of sleep movements and patterns
      - Data synchronization pipeline for comprehensive tracking
      - LLM integration for personalized sleep quality feedback
      - Comparison of user data with scientific research
      
      ## Technologies Used
      
      This project leverages computer vision techniques, machine learning for pattern recognition, and data integration from wearable devices. The system uses a custom pipeline to synchronize different data sources and provide meaningful insights.
      
      ## Results
      
      - Successfully integrated multiple data streams for comprehensive sleep analysis
      - Created a system that provides personalized feedback based on scientific research
      - Developed a non-invasive sleep monitoring solution
    `,
    date: "December 2024",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Computer Vision", "Machine Learning", "Apple Watch", "Health Tech"],
    github: "#",
  },
  {
    id: "lunch-time",
    title: "Lunch-Time Web App",
    description: "A web app tracking dining hall occupancy using AI-based camera tracking with PyTorch and YOLO.",
    fullDescription: `
      ## Overview
      
      The Lunch-Time Web App was developed as a competition project to solve the problem of dining hall congestion. The application uses AI-based camera tracking to monitor occupancy levels in real-time, helping students find the least crowded dining options.
      
      ## Features
      
      - Real-time tracking of dining hall occupancy
      - AI-based camera analysis using PyTorch and YOLO
      - Image processing with OpenCV
      - Integration with public APIs for data enrichment
      - Ultra-fast response time (updates every 0.5ms)
      
      ## Technologies Used
      
      The project was built using React and JavaScript for the frontend, with PyTorch and YOLO (You Only Look Once) for AI-based camera tracking. OpenCV was used for image processing, and the system was integrated with public APIs for real-time data.
      
      ## Results
      
      - Optimized response time by 90%, achieving updates every 0.5ms
      - Won 2nd place in the school's Data Science Project competition
      - Successfully implemented an AI solution to a common campus problem
    `,
    date: "December 2024",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["React", "JavaScript", "PyTorch", "YOLO", "OpenCV"],
    github: "#",
    demo: "#",
  },
]

