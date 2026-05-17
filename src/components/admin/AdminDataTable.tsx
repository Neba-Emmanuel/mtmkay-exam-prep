'use client'

import { Card, CardContent } from '@/components/ui/card'

interface Column {
  key: string
  label: string
  render?: (row: Record<string, unknown>) => React.ReactNode
}

interface AdminDataTableProps {
  columns: Column[]
  rows: Record<string, unknown>[]
  emptyMessage?: string
}

export function AdminDataTable({ columns, rows, emptyMessage = 'No data found' }: AdminDataTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">{emptyMessage}</CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              {columns.map((col) => (
                <div key={col.key} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {col.label}
                  </span>
                  <span className="text-sm text-gray-900 break-words">
                    {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-600">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  )
}
