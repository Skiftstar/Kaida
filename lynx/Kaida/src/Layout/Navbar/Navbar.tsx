import { useState } from "react"
import { NavbarEntry } from "./NavbarEntry.jsx"

export function Navbar({
  toggleTheme,
  isDark,
  setCurrentScreen,
  navbarOpen,
  toggleNavbar,
}: {
  toggleTheme: () => void
  isDark: boolean
  setCurrentScreen: (screen: string) => void
  navbarOpen: boolean
  toggleNavbar: () => void
}) {
  const baseStyle = {
    width: navbarOpen ? "60%" : "0%",
  }

  const navElements: { path: string; name: string }[] = [
    { path: "/", name: "Home" },
    { path: "/chats", name: "Chats" },
  ]

  return (
    <view style={{ position: "absolute" }}>
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
          style={{
            width: baseStyle.width,
            // paddingTop: "50px",
            // paddingLeft: "20px",
          }}
          catchtap={(e) => {}} // This prevents the event from bubbling up
        >
          {navbarOpen && (
            <view>
              <image
                src="https://placehold.co/800x400.png" // Replace with your icon URL
                style={{ width: "full", height: "200px" }}
              />
              <view style={{ marginLeft: "10px" }}>
                {navElements.map(({ path, name }) => (
                  <NavbarEntry
                    name={`${name}`}
                    path={path}
                    setCurrentScreen={setCurrentScreen}
                    key={path}
                    toggleNavbar={toggleNavbar}
                  />
                ))}
              </view>
            </view>
          )}
          {navbarOpen && (
            <view bindtap={toggleTheme}>
              <text>{isDark ? "Light" : "Dark"} Mode</text>
            </view>
          )}
        </view>
      </view>
    </view>
  )
}
