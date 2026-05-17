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
} from 'lucide-react'
import { MarketingLayout } from '@/components/marketing/MarketingLayout'

const stats = [
  { value: '5,000+', label: 'Students preparing' },
  { value: '10,000+', label: 'Questions practiced' },
  { value: '4', label: 'Exam categories' },
  { value: '24/7', label: 'Access anywhere' },
]

const values = [
  {
    icon: Target,
    title: 'Exam-focused',
    description:
      'Every feature is built around real CBT conditions — timed tests, instant scoring, and past-question patterns.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50',
  },
  {
    icon: Heart,
    title: 'Accessible',
    description:
      'Quality prep should not depend on your school’s lab or library. We bring resources to phones and low-bandwidth devices.',
    gradient: 'from-purple-500 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
  },
  {
    icon: Sparkles,
    title: 'Insight-driven',
    description:
      'Analytics highlight weak topics so you study what matters instead of repeating what you already know.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-green-50 to-teal-50',
  },
]

const offerings = [
  { icon: BookOpen, title: 'CBT Practice', color: 'text-blue-600 bg-blue-100' },
  { icon: BarChart3, title: 'Performance Tracking', color: 'text-purple-600 bg-purple-100' },
  { icon: Beaker, title: 'Visual Practicals', color: 'text-green-600 bg-green-100' },
  { icon: GraduationCap, title: 'GCE, HND & More', color: 'text-orange-600 bg-orange-100' },
]

export default function AboutPage() {
  return (
    <MarketingLayout
      activeNav="about"
      badge="Our story"
      title="Empowering Cameroon’s next generation"
      subtitle="MTMKay Exam Prep helps students master GCE, HND, and professional exams with technology built for how you actually learn."
    >
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Exam prep that meets you where you are
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MTMKay Exam Prep is a computer-based testing and digital learning platform built
                for students preparing for national and professional examinations in Cameroon.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We combine realistic practice tests, detailed performance analytics, and visual
                science practicals — so whether you are in Douala, Bamenda, or a rural community,
                you can prepare with confidence.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-10 lg:p-14">
                <Users className="w-16 h-16 text-blue-300 mb-6" />
                <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-6">
                  &ldquo;Every student deserves the same chance to walk into the exam hall prepared.&rdquo;
                </blockquote>
                <p className="text-blue-200 text-sm">— The MTMKay team</p>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {offerings.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10"
                      >
                        <div className={`p-2 rounded-lg ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-white">{item.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What we stand for</h2>
            <p className="text-lg text-gray-600">
              Three principles guide everything we build for students across Cameroon.
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
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our mission</h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-10">
            To make quality exam preparation accessible to every student — through technology that
            works on everyday devices, in every corner of Cameroon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-700 bg-white rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start learning free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/80 rounded-full hover:bg-white/10 transition-all"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
