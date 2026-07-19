'use client'
import { Zap, Twitter, Linkedin, Youtube, Instagram, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Event: ['Schedule', 'Speakers', 'Sponsors', 'Press Kit'],
  Tickets: ['General Admission', 'VIP Access', 'Group Bookings', 'Refund Policy'],
  Resources: ['FAQ', 'Hotel Partners', 'Travel Guide', 'Code of Conduct'],
  Company: ['About NEXUS', 'Past Events', 'Careers', 'Contact'],
}

export default function FooterSection() {
  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      {/* Top section */}
      <div className="relative bg-ash/30">
        <div className="absolute inset-0 bg-gradient-to-r from-ember/5 via-transparent to-plasma/5" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4 group">
                <div className="relative">
                  <Zap className="w-7 h-7 text-ember" fill="currentColor" />
                  <div className="absolute inset-0 blur-md bg-ember/50" />
                </div>
                <span className="font-display text-3xl tracking-wider text-white">NEXUS</span>
                <span className="font-mono text-xs text-ember border border-ember/40 px-1.5 py-0.5 rounded">2025</span>
              </div>
              <p className="font-body text-sm text-mist leading-relaxed mb-6 max-w-xs">
                The world's most immersive technology event. Where the future is built, not just discussed.
              </p>

              {/* Social */}
              <div className="flex gap-3">
                {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 glass rounded-lg border border-white/10 flex items-center justify-center text-mist hover:text-white hover:border-ember/30 hover:bg-ember/10 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-mono text-xs text-ember tracking-widest mb-4">{category.toUpperCase()}</h4>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-body text-sm text-mist hover:text-white transition-colors relative group"
                      >
                        {link}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-ember group-hover:w-full transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-display text-xl text-white tracking-wide">STAY IN THE LOOP</h4>
              <p className="font-mono text-xs text-mist mt-1">Get early access, speaker drops, and insider updates.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 bg-ash/60 border border-white/10 focus:border-ember/50 rounded-lg px-4 py-2.5 font-mono text-sm text-white placeholder-mist/40 outline-none transition-colors"
              />
              <button className="px-5 py-2.5 bg-ember hover:bg-ember/90 text-white font-display text-sm tracking-wide rounded-lg glow-ember transition-all hover:scale-105">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-mist/50">
            © 2025 NEXUS Events Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(item => (
              <a key={item} href="#" className="font-mono text-xs text-mist/40 hover:text-mist transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-mist/40" />
              <span className="font-mono text-xs text-mist/40">hello@nexus2025.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-mist/40" />
              <span className="font-mono text-xs text-mist/40">+1 (415) 555-0199</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
