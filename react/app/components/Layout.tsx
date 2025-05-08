import { useState } from 'react'
import { Navbar } from './Navbar/Navbar.js'
import { Outlet, useNavigate } from 'react-router'
import { useUser } from '~/contexts/UserContext.js'
import { PageContext } from '~/contexts/PageContext.js'

export function SideLayout() {
  const [isDark, setIsDark] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('')

  const { user } = useUser()
  const isLoggedIn = user !== undefined

  const nav = useNavigate()

  const themeClass = isDark ? 'theme-dark' : 'theme-light'

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev)
  }

  return (
    <div
      className={`w-[100vw] h-[100vh] ${
        isDark ? '!bg-[#ffffff]' : '!bg-[#000000]'
      }`}
    >
      <div
        className={`${themeClass}`}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          aspectRatio: '9 / 19',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: '20px',
          zIndex: 0
        }}
      >
        <div style={{ flex: 1 }}>
          {isLoggedIn && (
            <div
              style={{
                height: '50px',
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                gap: '20px',
                paddingLeft: '20px',
                paddingBottom: '15px',
                marginTop: '15px'
              }}
            >
              {!navbarOpen && (
                <div>
                  <button
                    onClick={toggleNavbar}
                    style={{ fontSize: '26px', fontWeight: 'bold' }}
                  >
                    =
                  </button>
                </div>
              )}
              <span
                style={{ fontWeight: 'bold', fontSize: '26px' }}
                className="text-nowrap overflow-hidden truncate max-w-[70%]"
              >
                {currentScreen}
              </span>
              <button
                onClick={() => {
                  nav('/profile')
                  setCurrentScreen('Profile')
                }}
                className="ml-auto mr-5"
              >
                <div className="w-[40px] h-[40px] rounded-full !bg-[var(--textinput-background-color)] flex items-center justify-center">
                  <span>{user.username.substring(0, 2).toUpperCase()}</span>
                </div>
              </button>
            </div>
          )}
          <PageContext.Provider
            value={{
              currPage: currentScreen,
              setCurrPage: setCurrentScreen
            }}
          >
            <Outlet />
          </PageContext.Provider>
        </div>

        {navbarOpen && (
          <Navbar
            isDark={isDark}
            toggleTheme={toggleTheme}
            setCurrentScreen={setCurrentScreen}
            navbarOpen={navbarOpen}
            toggleNavbar={toggleNavbar}
          />
        )}
      </div>
    </div>
  )
}
