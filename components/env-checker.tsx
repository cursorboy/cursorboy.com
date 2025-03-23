"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X } from "lucide-react"

export function EnvChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // This will run only on the client side
    // We're checking for environment variables that might be referenced in the code
    // but not actually needed anymore
    const envVars = {
      SENDGRID_API_KEY: process.env.NEXT_PUBLIC_SENDGRID_API_KEY || "",
      RESEND_API_KEY: process.env.NEXT_PUBLIC_RESEND_API_KEY || "",
    }

    const missing = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    // Only show missing vars that we actually need
    // We've switched to Resend, so we only need RESEND_API_KEY
    const neededVars = missing.filter((key) => key === "RESEND_API_KEY")

    setMissingVars(neededVars)
  }, [])

  if (missingVars.length === 0 || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-amber-100 text-amber-900 p-4 rounded-lg shadow-lg">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium">Environment Variable Check</h3>
          <p className="text-sm mt-1">The following environment variables are needed for full functionality:</p>
          <ul className="text-sm mt-2 list-disc pl-5">
            {missingVars.map((variable) => (
              <li key={variable}>{variable}</li>
            ))}
          </ul>
        </div>
        <button onClick={() => setIsVisible(false)} className="flex-shrink-0 text-amber-500 hover:text-amber-700">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

