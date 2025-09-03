"use client"

import { Twitter, Github, Linkedin } from "lucide-react"

export function SocialLinks() {
  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ]

  return (
    <div className="flex space-x-2">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="glass p-2 rounded-full hover:glass-strong transition-all duration-300 group"
          aria-label={label}
        >
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
      ))}
    </div>
  )
}
