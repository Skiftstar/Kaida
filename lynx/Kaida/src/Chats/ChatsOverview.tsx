import { useNavigate } from "react-router"
import { formatDate } from "./../DateUtil.js"

export function Chats() {
  const nav = useNavigate()

  const chats = [
    {
      id: 1,
      title: "Veeeeeeery long title wawawawawawawawabebebebebebebe",
      lastMessage:
        "Hello, this is a long message that should be truncated if it is too long",
      timestamp: 1744359120,
    },
    {
      id: 2,
      title: "Chat 2",
      lastMessage: "This is a short message",
      timestamp: 1743495120,
    },
    {
      id: 3,
      title: "Veeeeeeery long title wawawawawawawawabebebebebebebe",
      lastMessage: "Another message here",
      timestamp: 1733821920,
    },
  ]

  return (
    <view>
      <view>
        {chats.map((chat) => {
          const date = formatDate(new Date(chat.timestamp * 1000))
          return (
            <view
              key={chat.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "10px",
                margin: "10px",
              }}
              bindtap={() => nav(`/chats/${chat.id}`)}
            >
              <view
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <text
                  style={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {chat.title}
                </text>
                <text
                  style={{
                    color: "#888",
                    marginLeft: "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {date}
                </text>
              </view>
              <text
                style={{
                  display: "block",
                  color: "#888",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: "5px",
                }}
              >
                {chat.lastMessage}
              </text>
            </view>
          )
        })}
      </view>
    </view>
  )
}
