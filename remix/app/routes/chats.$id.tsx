import { useParams } from "@remix-run/react"
import { useEffect, useState } from "react"
import { demoTextMsgs } from "~/DemoData"

export default function ChatsDetail() {
  const { id } = useParams()
  const [inputValue, setInputValue] = useState("")
  const [textmsgs, setTextMsgs] = useState<
    {
      id: number
      sender: string
      message: string
      timestamp: number
    }[]
  >(demoTextMsgs)

  useEffect(() => {
    const div = document.getElementById("scroll")
    if (div) {
      div.scrollTop = div.scrollHeight
    }
  }, [textmsgs])

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <div
        id="scroll"
        style={{
          height: "84%",
          width: "full",
          overflowY: "scroll",
        }}
      >
        {textmsgs.map((msg) => {
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender === "User" ? "end" : "start",
                borderRadius: "10px",
                padding: "5px",
                marginRight: "10px",
                marginLeft: "10px",
                width: "fit",
              }}
            >
              <div
                className={msg.sender === "User" ? "userMessage" : "botMessage"}
                style={{
                  borderRadius: "10px",
                  padding: "10px",
                  maxWidth: "85%",
                  wordWrap: "break-word", // or use overflowWrap
                }}
              >
                <span className="max-w-full break-words">{msg.message}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 ml-2 w-full items-center justify-center flex">
        <input
          className="textInput"
          style={{
            width: "85%",
            height: "40px",
            borderRadius: "10px",
            paddingLeft: "10px",
            marginRight: "10px",
            fontSize: "20px",
          }}
          type="text"
          size={50}
          placeholder="Input..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value)
          }}
        />
        <div
          style={{
            width: "10%",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            className="font-bold text-[#007AFF] text-xl"
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#007AFF",
            }}
            onClick={() => {
              if (!inputValue || inputValue.length === 0) return
              setTextMsgs((prev) => [
                ...prev,
                {
                  message: inputValue,
                  sender: "User",
                  timestamp: Date.now(),
                  id: prev.length + 1,
                },
              ])
              setInputValue("")
            }}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  )
}
