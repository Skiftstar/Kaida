export function formatDate(date: Date): string {
  const now = new Date()

  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()

  const isSameYear = date.getFullYear() === now.getFullYear()

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  if (isSameDay) {
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12

    return `${hours}:${minutes} ${ampm}`
  } else if (isSameYear) {
    const month = months[date.getMonth()]
    const day = date.getDate()
    return `${month} ${day}`
  } else {
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${month} ${year}`
  }
}
