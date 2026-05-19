import Link from 'next/link'
import { BookOpen, BarChart3, Beaker, Briefcase, ArrowRight, CheckCircle, TrendingUp, Target, Zap, Users, Award, Clock } from 'lucide-react'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  path: '/',
  description:
    'Prepare for GCE, HND, concours, and professional exams in Cameroon with CBT practice, past questions, instant results, analytics, and visual science practicals.',
})

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Modern Gradient with Abstract Shapes */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/90">Trusted by 10,000+ Students</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Master Your Exams with{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  MTMKay
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Practice with real exam conditions, track your progress, and ace your GCE, HND, and professional exams in Cameroon. Join thousands of successful students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Watch Demo
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: 'Practice Questions', value: '5000+' },
                  { label: 'Past Papers', value: '200+' },
                  { label: 'Success Rate', value: '92%' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-sm text-white/70">Practice Session - GCE A/L Mathematics</div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Question 1 of 40</span>
                        <span className="text-sm text-gray-300">Time: 45:32 remaining</span>
                      </div>
                      <p className="text-white mb-4">Find the derivative of f(x) = 3x⁴ - 2x³ + 5x - 7</p>
                      <div className="space-y-2">
                        {['12x³ - 6x² + 5', '12x³ - 6x² + 5x', '12x³ - 6x²', '12x³ + 6x² + 5'].map((option, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-xs text-white/70">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-gray-200">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-blue-500 rounded-lg text-white font-medium">Submit Answer</button>
                      <button className="px-6 py-3 bg-white/10 rounded-lg text-white">Next →</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section - Modern Card Design */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with proven learning methodologies to help you achieve your best.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'CBT Practice',
                description: 'Experience real exam conditions with timed tests, randomized questions, and instant results.',
                icon: BookOpen,
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                features: ['Timed simulations', 'Randomized questions', 'Instant scoring']
              },
              {
                title: 'Performance Analytics',
                description: 'Track your progress with detailed insights and personalized study recommendations.',
                icon: BarChart3,
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50',
                features: ['Weak topic identification', 'Progress tracking', 'Smart recommendations']
              },
              {
                title: 'Visual Practicals',
                description: 'Master science experiments with interactive visual simulations and step-by-step guides.',
                icon: Beaker,
                gradient: 'from-orange-500 to-red-500',
                bgGradient: 'from-orange-50 to-red-50',
                features: ['Interactive simulations', 'Step-by-step guides', 'Lab safety training']
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((featureItem, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {featureItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Exam Categories - Modern Grid with Icons */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Exam Categories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Exam Coverage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We cover a wide range of exams to help you prepare for your future, from secondary to professional levels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'GCE Ordinary Level', 
                icon: BookOpen, 
                subjects: 12,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                iconColor: 'text-blue-600'
              },
              { 
                name: 'GCE Advanced Level', 
                icon: BarChart3, 
                subjects: 18,
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50',
                iconColor: 'text-purple-600'
              },
              { 
                name: 'HND & BTS', 
                icon: Briefcase, 
                subjects: 8,
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50',
                iconColor: 'text-green-600'
              },
              { 
                name: 'Concours & Professional', 
                icon: Award, 
                subjects: 15,
                color: 'from-orange-500 to-orange-600',
                bgColor: 'bg-orange-50',
                iconColor: 'text-orange-600'
              },
            ].map((category, idx) => {
              const Icon = category.icon
              return (
                <Link key={idx} href={`/exams/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="group">
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className={`w-20 h-20 ${category.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-10 h-10 ${category.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{category.subjects} subjects available</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      Explore
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Students', value: '10,000+', icon: Users, change: '+25%' },
              { label: 'Practice Questions', value: '5,000+', icon: BookOpen, change: '+150' },
              { label: 'Success Rate', value: '92%', icon: Award, change: '+8%' },
              { label: 'Hours Saved', value: '500K+', icon: Clock, change: 'Total' },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful students who achieved their goals with MTMKay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah M.',
                role: 'GCE A/L Candidate',
                content: 'MTMKay transformed my exam preparation. The CBT practice was exactly like the real exam, and the analytics helped me focus on my weak areas.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
              },
              {
                name: 'John D.',
                role: 'HND Engineering Student',
                content: 'The visual practicals were a game-changer. I could understand complex experiments without needing a physical lab. Highly recommended!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
              },
              {
                name: 'Marie K.',
                role: 'Concours Candidate',
                content: 'I passed my concours on the first try thanks to MTMKay. The past questions and performance tracking gave me the confidence I needed.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fixed Gradient with Visible Buttons */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-30"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Success Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already using MTMKay to ace their exams. Get started today with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-6">
            No credit card required. Free trial includes full access to all features.
          </p>
        </div>
      </section>

      {/* Footer - Modern Dark Footer */}
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