import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/marketing/MarketingLayout'
import { ContactForm } from '@/components/marketing/ContactForm'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Contact',
  path: '/contact',
  description:
    'Contact MTMKay Exam Prep for student support, school partnerships, subscriptions, and questions about exam preparation in Cameroon.',
})

const contactMethods = [
  {
    icon: Mail,
    title: 'Email us',
    detail: 'support@mtmkay.com',
    hint: 'We reply within 24 hours',
    href: 'mailto:support@mtmkay.com',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Phone,
    title: 'Call us',
    detail: '+237 6XX XXX XXX',
    hint: 'Mon–Fri, 8am–6pm WAT',
    href: 'tel:+237600000000',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: MapPin,
    title: 'Visit us',
    detail: 'Douala, Cameroon',
    hint: 'By appointment',
    href: null,
    gradient: 'from-emerald-500 to-teal-600',
  },
]

const faqs = [
  {
    q: 'How do I reset my password?',
    a: 'Use the forgot-password link on the login page, or email support with your registered email.',
  },
  {
    q: 'Can schools get bulk access?',
    a: 'Yes — contact us about school plans and student onboarding for your institution.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'MTN MoMo and Orange Money support is coming soon. Free tier is available today.',
  },
]

export default function ContactPage() {
  return (
    <MarketingLayout
      activeNav="contact"
      badge="We are here to help"
      title="Let's talk"
      subtitle="Questions about exams, subscriptions, or partnerships? Reach out — our team is ready to support your journey."
    >
      <section className="py-16 lg:py-24 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method) => {
              const Icon = method.icon
              const content = (
                <div className="h-full p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-6 shadow-md`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-blue-600 font-medium mb-2">{method.detail}</p>
                  <p className="text-sm text-gray-500">{method.hint}</p>
                </div>
              )
              return method.href ? (
                <Link key={method.title} href={method.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={method.title}>{content}</div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white">
                <Clock className="w-10 h-10 text-blue-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">Support hours</h3>
                <ul className="space-y-2 text-blue-100 text-sm">
                  <li>Monday – Friday: 8:00 – 18:00 WAT</li>
                  <li>Saturday: 9:00 – 14:00 WAT</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-8">
                <MessageCircle className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick answers</h3>
                <ul className="space-y-5">
                  {faqs.map((faq) => (
                    <li key={faq.q}>
                      <p className="font-medium text-gray-900 text-sm mb-1">{faq.q}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
