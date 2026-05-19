import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Admin',
  path: '/admin',
  noIndex: true,
})

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
