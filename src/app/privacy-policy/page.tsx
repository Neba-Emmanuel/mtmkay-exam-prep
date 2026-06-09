import Link from 'next/link'
import { Shield, Database, Lock, UserCheck, Mail } from 'lucide-react'
import { MarketingLayout } from '@/components/marketing/MarketingLayout'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Privacy Policy',
  path: '/privacy-policy',
  description:
    'Read the MTMKay Exam Prep privacy policy and learn how student account, exam activity, and platform usage data are protected.',
})

const sections = [
  {
    id: 'collect',
    icon: Database,
    title: 'Information we collect',
    content: [
      'Account details you provide at registration: name, email address, and optional phone number.',
      'Exam activity: subjects attempted, scores, time spent, and answers submitted during practice or exam mode.',
      'Device and usage data: browser type, session timestamps, and general analytics to improve the platform.',
    ],
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'use',
    icon: Shield,
    title: 'How we use your data',
    content: [
      'To deliver exam preparation services, including CBT practice, results, and progress tracking.',
      'To process subscriptions and payments when you upgrade your plan.',
      'To send important account notifications and respond to support requests.',
      'To improve our question bank, practicals, and overall learning experience through aggregated analytics.',
    ],
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Data security',
    content: [
      'Passwords are stored using industry-standard hashing — we never store plain-text passwords.',
      'All communication between your browser and our servers uses HTTPS encryption.',
      'Access to personal data is restricted to authorized personnel only.',
    ],
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: 'Your rights',
    content: [
      'You may request a copy of the personal data we hold about you.',
      'You may ask us to correct inaccurate information or delete your account and associated data.',
      'You may opt out of non-essential communications at any time.',
      'To exercise these rights, contact us at support@mtmkay.com.',
    ],
    gradient: 'from-amber-500 to-orange-600',
  },
]

export default function PrivacyPage() {
  return (
    <MarketingLayout
      activeNav="privacy"
      badge="Your privacy matters"
      title="Privacy Policy"
      subtitle="We are committed to protecting your personal information and being transparent about how we use it."
    >
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                  On this page
                </p>
                <nav className="space-y-2">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">May {new Date().getFullYear()}</p>
                </div>
              </div>
            </aside>

            <div className="flex-1 space-y-8">
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <Shield className="w-12 h-12 mb-4 opacity-90" />
                <p className="text-lg leading-relaxed text-blue-50">
                  MTMKay Exam Prep does not sell your personal information to third parties. We use
                  your data only to provide and improve our exam preparation services.
                </p>
              </div>

              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 pt-2">{section.title}</h2>
                    </div>
                    <ul className="space-y-4">
                      {section.content.map((paragraph) => (
                        <li
                          key={paragraph.slice(0, 40)}
                          className="flex gap-3 text-gray-600 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                          {paragraph}
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Mail className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Questions about privacy?</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Contact our team at{' '}
                  <a href="mailto:support@mtmkay.com" className="text-blue-600 font-medium hover:underline">
                    support@mtmkay.com
                  </a>
                </p>
                <Link
                  href="/contact"
                  className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg transition-all"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
