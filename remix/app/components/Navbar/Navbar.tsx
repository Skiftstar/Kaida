import { NavbarEntry } from "./NavbarEntry.js";

export function Navbar({
  toggleTheme,
  isDark,
  setCurrentScreen,
  navbarOpen,
  toggleNavbar,
}: {
  toggleTheme: () => void;
  isDark: boolean;
  setCurrentScreen: (screen: string) => void;
  navbarOpen: boolean;
  toggleNavbar: () => void;
}) {
  const baseStyle = {
    width: navbarOpen ? "60%" : "0%",
  };

  const navElements: { path: string; name: string }[] = [
    { path: "/", name: "Chats" },
    { path: "/meds", name: "Medication" },
    { path: "/sessions", name: "Sessions" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        height: "932px",
        width: "430px",
        top: "0",
        left: "0",
        display: navbarOpen ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          height: "932px",
          width: "430px",
          display: navbarOpen ? "block" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={toggleNavbar}
      >
        <div
          className={`navbar`}
          style={{
            width: baseStyle.width,
            position: "absolute",
            top: "0",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transition: "width 0.1s ease-in",
            overflow: "hidden",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          //   ={(e) => {}} // This prevents the event from bubbling up
        >
          {navbarOpen && (
            <div>
              <img
                src={"https://placehold.co/600x400.png"} // Replace with your icon URL
                style={{ width: "full", height: "200px" }}
                alt="navbar"
              />
              <div style={{ marginLeft: "10px" }}>
                {navElements.map(({ path, name }) => (
                  <NavbarEntry
                    name={`${name}`}
                    path={path}
                    setCurrentScreen={setCurrentScreen}
                    key={path}
                    toggleNavbar={toggleNavbar}
                  />
                ))}
              </div>
            </div>
          )}
          {navbarOpen && (
            <div onClick={toggleTheme}>
              <text>{isDark ? "Light" : "Dark"} Mode</text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
