import { useState } from "react";
import { Navbar } from "./Navbar/Navbar.js";
import { Outlet, useNavigate } from "react-router";

export function SideLayout({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("Chats");

  const nav = useNavigate();

  const themeClass = isDark ? "theme-dark" : "theme-light";

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev);
  };

  return (
    <div className="w-[100vw] h-[100vh] !bg-black">
      <div
        className={`${themeClass}`}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          height: "100%",
          aspectRatio: "9 / 19",
          marginLeft: "auto",
          marginRight: "auto",
          borderRadius: "20px",
          zIndex: 0,
        }}
      >
        <div style={{ flex: 1 }}>
          {isLoggedIn && (
            <div
              style={{
                height: "50px",
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "20px",
                paddingLeft: "20px",
                paddingBottom: "15px",
                marginTop: "15px",
              }}
            >
              {!navbarOpen && (
                <div>
                  <button
                    onClick={toggleNavbar}
                    style={{ fontSize: "26px", fontWeight: "bold" }}
                  >
                    =
                  </button>
                </div>
              )}
              <span style={{ fontWeight: "bold", fontSize: "26px" }}>
                {currentScreen}
              </span>
              <button
                onClick={() => {
                  nav("/profile");
                  setCurrentScreen("Profile");
                }}
                className="ml-auto mr-5"
              >
                <img
                  src="https://placehold.co/50x50.png"
                  alt="profile"
                  className="rounded-full w-[40px]"
                />
              </button>
            </div>
          )}
          <Outlet />
        </div>

        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          setCurrentScreen={setCurrentScreen}
          navbarOpen={navbarOpen}
          toggleNavbar={toggleNavbar}
        />
      </div>
    </div>
  );
}
