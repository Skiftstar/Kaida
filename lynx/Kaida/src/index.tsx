import { root } from "@lynx-js/react"
import { MemoryRouter, Outlet, Route, Routes } from "react-router"
import { Chats } from "./Chats/ChatsOverview.jsx"
import { Layout } from "./Layout/Layout.jsx"
import { ChatsDetail } from "./Chats/ChatsDetail.jsx"
import { Meds } from "./Meds/Meds.jsx"
import { Sessions } from "./Sessions/Sessions.jsx"

root.render(
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Chats />} />
        <Route path="chats/:id" element={<ChatsDetail />} />
        <Route path="meds" element={<Meds />} />
        <Route path="sessions" element={<Sessions />} />
      </Route>
    </Routes>
  </MemoryRouter>
)

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
}
