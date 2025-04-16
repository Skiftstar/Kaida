import { useCallback, useEffect, useState } from "@lynx-js/react"

import "./App.css"
import arrow from "./assets/arrow.png"
import { useNavigate } from "react-router"

export function App() {
  const [alterLogo, setAlterLogo] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    console.info("Hello, ReactLynx")
  }, [])

  const onTap = useCallback(() => {
    "background only"
    setAlterLogo(!alterLogo)
  }, [alterLogo])

  return (
    <view>
      <view className="Content">
        <image src={arrow} className="Arrow" />
        <text className="Description">Tap the logo and have fun!</text>
        <text className="Hint">Wat</text>
      </view>
      <view style={{ flex: 1 }}></view>
    </view>
  )
}
