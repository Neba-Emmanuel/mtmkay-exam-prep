import { MarketingLayout } from '@/components/marketing/MarketingLayout'
import { ContactForm } from '@/components/marketing/ContactForm'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Contact',
  path: '/contact',
  description:
    'Contact MTMKay Exam Prep for student support, school partnerships, subscriptions, and questions about exam preparation in Cameroon.',
})

export default function ContactPage() {
  return (
    <MarketingLayout
      activeNav="contact"
      badge="We are here to help"
      title="Let's talk"
      subtitle="Questions about exams, subscriptions, or partnerships? Reach out — our team is ready to support your journey."
    >
      <section className="py-16 lg:py-24 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  We're just a
                </span>
                <br />
                <span className="text-gray-900">message away...</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our support team will get to you immediately!
              </p>
              <div className="pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-12 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  <span>Fast response • 24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}