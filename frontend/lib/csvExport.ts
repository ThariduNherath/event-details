export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    const str = String(val ?? '')
    // Wrap in quotes if it contains a comma, quote, or newline; escape inner quotes
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ]

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}