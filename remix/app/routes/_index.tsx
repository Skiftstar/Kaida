import type { MetaFunction } from "@remix-run/node"
import { useNavigate } from "@remix-run/react"
import { formatDate } from "~/util/DateUtil"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export default function Index() {
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
    <div>
      <div>
        {chats.map((chat) => {
          const date = formatDate(new Date(chat.timestamp * 1000))
          // const date = "";
          return (
            <button
              style={{ width: "100%" }}
              key={chat.id}
              onClick={() => nav(`/chats/${chat.id}`)}
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  margin: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.title}
                  </span>
                  <span
                    style={{
                      color: "#888",
                      marginLeft: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {date}
                  </span>
                </div>
                <span
                  style={{
                    display: "block",
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: "5px",
                    textAlign: "start",
                  }}
                >
                  {chat.lastMessage}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
