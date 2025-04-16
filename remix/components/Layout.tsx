import { useState } from "react"
import { Navbar } from "./Navbar/Navbar.jsx"

export function SideLayout() {
  const [isDark, setIsDark] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [currentScreen, setCurrentScreen] = useState("Chats")

  const themeClass = isDark ? "theme-dark" : "theme-light"

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev)
  }

  return (
    <div
      className={themeClass}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "100px",
            display: "flex",
            justifyContent: "start",
            alignItems: "end",
            gap: "40px",
            paddingLeft: "20px",
            paddingBottom: "20px",
          }}
        >
          {!navbarOpen && (
            <div onClick={toggleNavbar}>
              <span style={{ fontSize: "26px", fontWeight: "bold" }}>=</span>
            </div>
          )}
          <span style={{ fontWeight: "bold", fontSize: "26px" }}>
            {currentScreen}
          </span>
        </div>
      </div>

      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        setCurrentScreen={setCurrentScreen}
        navbarOpen={navbarOpen}
        toggleNavbar={toggleNavbar}
      />
    </div>
  )
}
