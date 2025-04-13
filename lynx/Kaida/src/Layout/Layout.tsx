import { useState } from "react"
import { Outlet } from "react-router"
import { Navbar } from "./Navbar/Navbar.jsx"
import "./../App.css"

export function Layout() {
  const [isDark, setIsDark] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [currentScreen, setCurrentScreen] = useState("Home")

  const themeClass = isDark ? "theme-dark" : "theme-light"

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev)
  }

  return (
    <view
      className={themeClass}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
      }}
    >
      <view style={{ flex: 1 }}>
        <view
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
            <view bindtap={toggleNavbar}>
              <text style={{ fontSize: "26px", fontWeight: "bold" }}>=</text>
            </view>
          )}
          <text style={{ fontWeight: "bold", fontSize: "26px" }}>
            {currentScreen}
          </text>
        </view>
        <Outlet />
      </view>

      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        setCurrentScreen={setCurrentScreen}
        navbarOpen={navbarOpen}
        toggleNavbar={toggleNavbar}
      />
    </view>
  )
}
