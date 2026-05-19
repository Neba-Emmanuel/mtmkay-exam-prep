import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Student Dashboard',
  path: '/dashboard',
  noIndex: true,
})

export default function StudentRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
