import { root } from "@lynx-js/react"

import { App } from "./App.js"
import { MemoryRouter, Outlet, Route, Routes } from "react-router"
import { Chats } from "./Chats/ChatsOverview.jsx"
import { Layout } from "./Layout/Layout.jsx"
import { ChatsDetail } from "./Chats/ChatsDetail.jsx"

root.render(
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<App />} />
        <Route path="chats" element={<Chats />} />
        <Route path="chats/:id" element={<ChatsDetail />} />
      </Route>
    </Routes>
  </MemoryRouter>
)

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
}
