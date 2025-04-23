import { useNavigate, type MetaFunction } from "react-router"
import { formatDate } from "./../util/DateUtil"
import { usePage } from "~/contexts/PageContext"
import { useEffect, useState } from "react"
import {
  createNewDiagnosis,
  getAllChatsOfUser,
  createNewChat,
} from "~/util/Api"
import type { Chat } from "~/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Kaida" },
    { name: "description", content: "Welcome to Kaida!" },
  ]
}

export default function Index() {
  const nav = useNavigate()

  const [chats, setChats] = useState<Chat[]>([])

  const { setCurrPage } = usePage()
  setCurrPage("Chats")

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    const chats = await getAllChatsOfUser()
    setChats(chats)
  }

  const handleNewChat = async () => {
    const diagnosis_id = await createNewDiagnosis(
      "New Diagnosis",
      "New Diagnosis",
    )
    if (!diagnosis_id) return //TODO: Show error

    const chat_id = await createNewChat(diagnosis_id)
    if (!chat_id) return //TODO: Cleanup diagnosis, dispaly error

    const timestamp = Date.now()

    setChats((old) => [
      {
        id: chat_id,
        last_message: "",
        timestamp,
        title: "New Diagnosis",
      },
      ...old,
    ])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="overflow-scroll">
        {chats.map((chat) => {
          const date = formatDate(new Date(chat.timestamp))
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
      <div className="mt-auto w-full">
        <button
          onClick={handleNewChat}
          className="w-full h-12 font-bold bg-blue-500 text-white pointer-events-auto"
        >
          New Chat
        </button>
      </div>
    </div>
  )
}
