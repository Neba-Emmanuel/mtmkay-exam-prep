import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

type MarketingNav = 'home' | 'about' | 'contact' | 'privacy'

interface MarketingLayoutProps {
  activeNav?: MarketingNav
  badge?: string
  title: string
  subtitle: string
  children: React.ReactNode
}

const navItems: Array<{ href: string; label: string; key: MarketingNav }> = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/contact', label: 'Contact', key: 'contact' },
  { href: '/privacy', label: 'Privacy', key: 'privacy' },
]

const HERO_PATTERN =
  "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')]"

export function MarketingLayout({
  activeNav,
  badge,
  title,
  subtitle,
  children,
}: MarketingLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/mtmkay_logo.png" 
              alt="MTMKay Exam Prep" 
              className="h-10 w-10 rounded-lg object-contain transition-transform group-hover:scale-105" 
            />
            <div>
              <p className="text-sm font-bold text-blue-950">MTMKay</p>
              <p className="text-xs text-blue-400">Exam Prep</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 ${
                  activeNav === item.key 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced Shapes */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-sky-700 min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Pattern Overlay */}
        <div className={`absolute inset-0 ${HERO_PATTERN} opacity-20`} />
        
        {/* Additional Floating Shapes */}
        <div className="absolute top-20 left-10 w-24 h-24 border-4 border-white/10 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 border-4 border-white/10 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-45 animate-spin-slow"></div>
        
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          {badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-50 backdrop-blur-sm animate-fade-up mb-5">
              <BookOpen className="h-4 w-4 text-sky-200" />
              {badge}
            </div>
          )}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl animate-fade-up">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg animate-fade-up animation-delay-100">
            {subtitle}
          </p>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {children}

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/mtmkay_logo.png" alt="MTMKay Logo" width={50} height={50} className="rounded-lg" />
                      <div>
                        <h3 className="text-white font-bold text-xl">MTMKay</h3>
                        <p className="text-gray-400 text-sm">Exam Prep Platform</p>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md">
                      Empowering students in Cameroon to achieve exam success through innovative technology and comprehensive preparation tools.
                    </p>
                    <div className="flex gap-4">
                      {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                        <a key={social} href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <span className="text-gray-400 text-sm capitalize">{social[0]}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                      {['About', 'Contact', 'Blog', 'Careers'].map((link) => (
                        <li key={link}>
                          <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors">
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2">
                      {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((link) => (
                        <li key={link}>
                          <Link href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="text-gray-400 hover:text-white transition-colors">
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-gray-800 text-center">
                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} MTMKay Exam Prep. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
    </main>
  )
}