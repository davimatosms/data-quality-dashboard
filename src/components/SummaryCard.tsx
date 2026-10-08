interface SummaryCardProps {
  label: string
  value: number
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
