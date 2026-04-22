import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with your API key if available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // If Resend is not configured, return a success response without sending email
    if (!resend) {
      console.log("Contact form submission (Resend not configured):", data)
      return NextResponse.json({
        message: "Thank you for your message! I'll get back to you soon.",
      })
    }

    // Send email using Resend
    const { data: emailData, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // You can use this for testing
      to: "piamparekh17@gmail.com", // Your email
      subject: `New contact from ${data.name}`,
      replyTo: data.email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Thank you for your message! I'll get back to you soon.",
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

