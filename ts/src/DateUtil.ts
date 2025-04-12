export function formatDate(date: Date): string {
  const now = new Date()

  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()

  const isSameYear = now.getFullYear() === date.getFullYear()

  if (isSameDay) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } else if (isSameYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }
}

const date = new Date(1733821920 * 1000)
console.log(formatDate(date)) // Output: "Apr 13, 2024"
