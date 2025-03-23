"use client"

import { useEffect, useState } from "react"

export function EnvDebug() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Collect all environment variables that start with NEXT_PUBLIC_
    const publicVars: Record<string, string> = {}

    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        publicVars[key] = process.env[key] || ""
      }
    })

    setEnvVars(publicVars)
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-black/80 text-white rounded-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Environment Variables (Public Only)</h3>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
    </div>
  )
}

