import type { ReactElement } from 'react'
import { useNavigate } from 'react-router'

export function NavbarEntry({
  name,
  path,
  icon,
  setCurrentScreen,
  toggleNavbar
}: {
  name: string
  path: string
  icon: React.ReactElement
  setCurrentScreen: (screen: string) => void
  toggleNavbar: () => void
}) {
  const nav = useNavigate()

  return (
    <button
      key={path}
      onClick={() => {
        nav(path)
        setCurrentScreen(name)
        toggleNavbar()
      }}
      style={{
        padding: '10px',
        gap: '10px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      {icon}
      <span style={{ fontSize: '26px' }}>{name}</span>
    </button>
  )
}
