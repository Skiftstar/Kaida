import { useParams } from "react-router"

export function ChatsDetail() {
  const { id } = useParams()

  const textmsgs = [
    {
      id: 1,
      sender: "User",
      message:
        "Hello, this is a long message that should be wrapped if it is too long",
      timestamp: 1744359120,
    },
    {
      id: 2,
      sender: "Bot",
      message: "This is a short message",
      timestamp: 1743495120,
    },
    {
      id: 3,
      sender: "User",
      message: "Another message here",
      timestamp: 1733821920,
    },
  ]

  return (
    <view
      style={{
        // display: "flex",
        // flexDirection: "column",
        // flex: "0 0 80%",
        height: "100vh",
      }}
    >
      <view
        style={{
          height: "80%",
          width: "full",
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
        }}
      >
        {textmsgs.map((msg) => {
          return (
            <view
              style={{
                display: "flex",
                justifyContent: msg.sender === "User" ? "end" : "start",
                borderRadius: "10px",
                padding: "10px",
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
                }}
              >
                <text>{msg.message}</text>
              </view>
            </view>
          )
        })}
      </view>
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
