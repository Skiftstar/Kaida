import { useParams } from "react-router"
import { demoTextMsgs } from "../DemoData.js"
import { useState } from "react"

export function ChatsDetail() {
  const { id } = useParams()
  const [inputValue, setInputValue] = useState("")
  const [textmsgs, setTextMsgs] = useState(demoTextMsgs)

  return (
    <view
      style={{
        height: "100vh",
      }}
    >
      <scroll-view
        bindcontentsizechanged={() => {
          lynx
            .createSelectorQuery()
            .select(`#scroll`)
            .invoke({
              method: "autoScroll",
              params: {
                rate: 5000, // Scrolling speed in px/sec
                start: true,
              },
            })
            .exec()
        }}
        id="scroll"
        style={{
          height: "80%",
          width: "full",
        }}
      >
        {textmsgs.map((msg) => {
          return (
            <view
              style={{
                display: "flex",
                justifyContent: msg.sender === "User" ? "end" : "start",
                borderRadius: "10px",
                padding: "5px",
                // margin: "10px",
                marginRight: "10px",
                marginLeft: "10px",
                width: "fit",
              }}
            >
              <view
                className={msg.sender === "User" ? "userMessage" : "botMessage"}
                style={{
                  borderRadius: "10px",
                  padding: "10px",
                  maxWidth: "85%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <text>{msg.message}</text>
              </view>
            </view>
          )
        })}
      </scroll-view>
      <view
        style={{
          display: "flex",
          justifyContent: "center",
          width: "full",
          marginTop: "20px",
          marginLeft: "10px",
        }}
      >
        <input
          className="textInput"
          style={{
            width: "90%",
            height: "50px",
            borderRadius: "10px",
            paddingLeft: "10px",
            paddingRight: "10px",
            fontSize: "20vw",
          }}
          type="text"
          size={50}
          placeholder="Input..."
          value={inputValue}
          bindinput={(e) => {
            setInputValue(e.detail.value)
          }}
        />
        <view
          style={{
            width: "10%",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          bindtap={() => {
            console.log("Send message:", inputValue)
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
          <text
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#007AFF",
            }}
          >
            {">"}
          </text>
        </view>
      </view>
    </view>
  )
}
