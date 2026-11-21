interface PointsBadgeProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
  showRupee?: boolean
}

export default function PointsBadge({ points, size = 'md', showRupee = true }: PointsBadgeProps) {
  const rupeeValue = (points / 2).toFixed(2)

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-xl px-4 py-2',
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 rounded-full font-semibold ${sizeClasses[size]}`}>
      <span>⭐</span>
      <span>{points.toLocaleString()} pts</span>
      {showRupee && (
        <span className="text-orange-500 font-normal text-xs">
          ≈ ₹{rupeeValue}
        </span>
      )}
    </div>
  )
}
