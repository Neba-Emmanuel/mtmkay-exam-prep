import Link from 'next/link'
import {
  Target,
  Users,
  Sparkles,
  BookOpen,
  BarChart3,
  Beaker,
  GraduationCap,
  Heart,
  ArrowRight,
  CheckCircle,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react'
import { MarketingLayout } from '@/components/marketing/MarketingLayout'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'About',
  path: '/about',
  description:
    'Learn about MTMKay Exam Prep, a Cameroon-focused digital learning platform for CBT practice, exam analytics, and visual science practicals.',
})

const stats = [
  { value: '5,000+', label: 'Active Students', icon: Users, change: '+45% this year' },
  { value: '10,000+', label: 'Questions Practiced', icon: BookOpen, change: '+2,000 last month' },
  { value: '98%', label: 'Student Satisfaction', icon: Heart, change: 'Based on 500+ reviews' },
  { value: '24/7', label: 'Platform Access', icon: Clock, change: 'From any device' },
]

const values = [
  {
    icon: Target,
    title: 'Exam-Focused',
    description:
      'Every feature is built around real CBT conditions — timed tests, instant scoring, and past-question patterns that mirror actual exams.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-600',
  },
  {
    icon: Heart,
    title: 'Accessible to All',
    description:
      'Quality prep should not depend on your school’s lab or library. We bring resources to phones and low-bandwidth devices across Cameroon.',
    gradient: 'from-purple-500 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-600',
  },
  {
    icon: Sparkles,
    title: 'Insight-Driven',
    description:
      'Advanced analytics highlight weak topics so you study what matters instead of repeating what you already know.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-green-50 to-teal-50',
    iconBg: 'bg-emerald-600',
  },
]

const offerings = [
  { icon: BookOpen, title: 'CBT Practice', description: 'Real exam simulation', color: 'text-blue-600 bg-blue-100', border: 'border-blue-200' },
  { icon: BarChart3, title: 'Performance Analytics', description: 'Track your progress', color: 'text-purple-600 bg-purple-100', border: 'border-purple-200' },
  { icon: Beaker, title: 'Visual Practicals', description: 'Interactive experiments', color: 'text-green-600 bg-green-100', border: 'border-green-200' },
  { icon: GraduationCap, title: 'Multiple Exams', description: 'GCE, HND & more', color: 'text-orange-600 bg-orange-100', border: 'border-orange-200' },
]


export default function AboutPage() {
  return (
    <MarketingLayout
      activeNav="about"
      badge="Our story"
      title="Empowering Cameroon’s next generation"
      subtitle="MTMKay Exam Prep helps students master GCE, HND, and professional exams with technology built for how you actually learn."
    >
      {/* Mission & Vision Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-6">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Cameroon Focused</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Exam prep that meets you where you are
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MTMKay Exam Prep is a computer-based testing and digital learning platform built
                for students preparing for national and professional examinations in Cameroon.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We combine realistic practice tests, detailed performance analytics, and visual
                science practicals, so whether you are in Kumba, Buea, Douala, Bamenda, or a rural community,
                you can prepare with confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Free Resources', icon: CheckCircle },
                  { label: 'Paid Resources ', icon: CheckCircle },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 lg:p-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-2 text-xs text-white/50">Our Promise</div>
                </div>
                <Globe className="w-12 h-12 text-blue-300 mb-6" />
                <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-6">
                  &ldquo;Every student deserves the same chance to walk into the exam hall prepared.&rdquo;
                </blockquote>
                <p className="text-blue-200 text-sm mb-8">— The MTMKay team</p>
                <div className="grid grid-cols-2 gap-3">
                  {offerings.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className={`flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-3 border ${item.border} hover:bg-white/20 transition-all cursor-pointer`}
                      >
                        <div className={`p-1.5 rounded-lg ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-white block">{item.title}</span>
                          <span className="text-[10px] text-white/60">{item.description}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Our Impact</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Making a difference across Cameroon</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-700 font-medium mt-2 mb-1">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values Section - Enhanced */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Our Philosophy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What we stand for</h2>
            <p className="text-lg text-gray-600">
              Three core principles guide everything we build for students across Cameroon.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className={`group p-8 rounded-2xl bg-gradient-to-br ${value.bg} border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div
                    className={`w-14 h-14 ${value.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  {/* <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link href="/features" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div> */}
                </div>
              )
            })}
          </div>
        </div>
      </section>
      

      {/* CTA Section - Fixed Version */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-30"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our mission
          </h2>
          <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
            To make quality exam preparation accessible to every student — through technology that
            works on everyday devices, in every corner of Cameroon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start learning free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              Get in touch
            </Link>
          </div>
          <p className="text-sm text-white/70 mt-6">
            Join 5,000+ students already preparing with MTMKay
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

// Add TrendingUp import
import { TrendingUp } from 'lucide-react'