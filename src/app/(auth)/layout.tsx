import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Account Access',
  path: '/login',
  noIndex: true,
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
