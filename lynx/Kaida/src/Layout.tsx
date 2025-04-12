import { useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import "./App.css"

export function Layout() {
  const [isDark, setIsDark] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)

  const themeClass = isDark ? "theme-dark" : "theme-light"

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev)
  }

  const baseStyle = {
    width: navbarOpen ? "60%" : "0%",
  }

  const nav = useNavigate()

  const navElements: { path: string; name: string }[] = [
    { path: "/", name: "Home" },
    { path: "/chats", name: "Chats" },
  ]

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
        <Outlet />
      </view>

      <view
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          height: "100vh",
          width: "100vw",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: navbarOpen ? "block" : "none",
        }}
        bindtap={toggleNavbar}
      >
        <view
          class={`navbar`}
          style={{ width: baseStyle.width }}
          catchtap={(e) => {}} // This prevents the event from bubbling up
        >
          {navElements.map(({ path, name }) => (
            <view key={path} bindtap={() => nav(path)}>
              <text>{name}</text>
            </view>
          ))}
          <view bindtap={toggleTheme}>
            <text>{isDark ? "Light" : "Dark"} Mode</text>
          </view>
        </view>
      </view>
      {!navbarOpen && (
        <view
          style={{
            position: "absolute",
            top: "50px",
            left: "20px",
            // padding: "20px",
          }}
          bindtap={toggleNavbar}
        >
          <text>=</text>
        </view>
      )}
    </view>
  )
}
