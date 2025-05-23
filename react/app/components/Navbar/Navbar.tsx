import type { ReactElement } from 'react'
import { NavbarEntry } from './NavbarEntry.js'
import ChatIcon from '@mui/icons-material/Chat'
import MedicationIcon from '@mui/icons-material/Medication'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

export function Navbar({
  toggleTheme,
  isDark,
  setCurrentScreen,
  navbarOpen,
  toggleNavbar
}: {
  toggleTheme: () => void
  isDark: boolean
  setCurrentScreen: (screen: string) => void
  navbarOpen: boolean
  toggleNavbar: () => void
}) {
  const baseStyle = {
    width: navbarOpen ? '60%' : '0%'
  }

  const navElements: {
    path: string
    name: string
    icon: React.ReactElement
  }[] = [
    { path: '/', name: 'Chats', icon: <ChatIcon /> },
    { path: '/meds', name: 'Medication', icon: <MedicationIcon /> },
    { path: '/sessions', name: 'Sessions', icon: <CalendarMonthIcon /> }
  ]

  return (
    <div
      style={{
        position: 'absolute',
        height: '100%',
        aspectRatio: '9 / 19',
        top: '0',
        left: '0',
        display: navbarOpen ? 'block' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: '100%',
          aspectRatio: '9 / 19',
          display: navbarOpen ? 'block' : 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={toggleNavbar}
      >
        <div
          className={`navbar ${navbarOpen ? 'navbar-anim' : 'navbar-close'}`}
          style={{
            width: baseStyle.width,
            position: 'absolute',
            top: '0',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'width 0.1s ease-in',
            overflow: 'hidden'
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {navbarOpen && (
            <div>
              <img
                src={isDark ? '/kaidabannerB.png' : '/kaidabannerL.png'}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                alt="navbar"
              />
              <div style={{ marginLeft: '10px' }}>
                {navElements.map(({ path, name, icon }) => (
                  <NavbarEntry
                    name={`${name}`}
                    path={path}
                    icon={icon}
                    setCurrentScreen={setCurrentScreen}
                    key={path}
                    toggleNavbar={toggleNavbar}
                  />
                ))}
              </div>
            </div>
          )}
          {navbarOpen && (
            <button
              onClick={toggleTheme}
              style={{
                padding: '10px',
                marginTop: 'auto',
                marginLeft: '10px',
                gap: '10px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              <span style={{ fontSize: '26px' }}>
                {isDark ? 'Light' : 'Dark'} Mode
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
