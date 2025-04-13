import { useParams } from "react-router"
import { demoTextMsgs } from "../DemoData.js"

export function ChatsDetail() {
  const { id } = useParams()

  const textmsgs = demoTextMsgs

  return (
    <view
      style={{
        // display: "flex",
        // flexDirection: "column",
        // flex: "0 0 80%",
        height: "100vh",
      }}
    >
      <scroll-view
        style={{
          height: "80%",
          width: "full",
          //   display: "flex",
          //   flexDirection: "column",
          //   overflow: "visible",
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              textmsgs.push({
                id: textmsgs.length + 1,
                sender: "User",
                message: e.currentTarget.value,
                timestamp: Math.floor(Date.now() / 1000),
              })
            }
            e.currentTarget.value = ""
          }}
        />
      </view>
    </view>
  )
}
