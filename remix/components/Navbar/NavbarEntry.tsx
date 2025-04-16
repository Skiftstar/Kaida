// import { useNavigate } from "react-router"

export function NavbarEntry({
  name,
  path,
  setCurrentScreen,
  toggleNavbar,
}: {
  name: string
  path: string
  setCurrentScreen: (screen: string) => void
  toggleNavbar: () => void
}) {
  //   const nav = useNavigate()

  return (
    <div
      key={path}
      //   onClick={() => {
      //     nav(path)
      //     setCurrentScreen(name)
      //     toggleNavbar()
      //   }}
      style={{
        padding: "10px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <img
        src="https://placehold.co/400.png" // Replace with your icon URL
        style={{ width: "26px", height: "26px", marginRight: "10px" }}
        alt="icon"
      />
      <span style={{ fontSize: "26px" }}>{name}</span>
    </div>
  )
}
