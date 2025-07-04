import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
  fetchAllChatMessages,
  getCoreChatInfo,
  insertNewChatMessage
} from '~/util/Api'
import type { ChatInfo, Message } from '~/types'
import {
  createChatSession,
  handleChatContinuation,
  handleUserInput
} from '~/gemini/gemini'
import type { ChatSession } from '@google/generative-ai'
import { usePage } from '~/contexts/PageContext'
import { ChatSettingsPopup } from '~/components/Popups/ChatSettingsPopup'
import SettingsIcon from '@mui/icons-material/Settings'
import SendIcon from '@mui/icons-material/Send'
import { useToast } from '~/contexts/ToastContext'

export default function ChatsDetail() {
  const { id } = useParams()

  const { setCurrPage } = usePage()
  const { setToast } = useToast()

  const [inputValue, setInputValue] = useState('')
  const [textmsgs, setTextMsgs] = useState<Message[]>([])
  const [chatCoreInfo, setChatCoreInfo] = useState<ChatInfo | undefined>(
    undefined
  )
  const [modelThinking, setModelThinking] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | undefined>(
    undefined
  )
  const [settingsPopup, setSettingsPopup] = useState(false)
  const [freshSession, setFreshSession] = useState(true)

  useEffect(() => {
    fetchChatMsgs()
    fetchChatCoreInfo()
    setChatSession(createChatSession())
  }, [])

  useEffect(() => {
    if (chatCoreInfo) setCurrPage(chatCoreInfo.title)
  }, [chatCoreInfo])

  useEffect(() => {
    const div = document.getElementById('scroll')
    if (div) {
      div.scrollTop = div.scrollHeight
    }
  }, [textmsgs])

  const fetchChatCoreInfo = async () => {
    const chatInfo = await getCoreChatInfo(Number(id))
    if (!chatInfo) {
      setToast('Failed fetching Chat Info!')
      return
    }
    setChatCoreInfo(chatInfo)
    setCurrPage(chatInfo.title)
  }

  const fetchChatMsgs = async () => {
    const messages = await fetchAllChatMessages(Number(id))

    if (!messages) {
      setToast('Failed fetching Messages!')
      return
    }

    setTextMsgs(messages)
  }

  const handleMessageSend = async (message: string) => {
    if (!chatSession || !chatCoreInfo) return

    if (
      freshSession &&
      textmsgs.find((msg) => msg.sender === 'Bot') !== undefined
    ) {
      await handleChatContinuation(chatSession, chatCoreInfo.id)
      setFreshSession(false)
    }

    const messageId = await insertNewChatMessage('User', message, Number(id))

    if (!messageId) {
      setToast('Failed sending Message!')
      return
    }

    setModelThinking(true)

    setTextMsgs((old) => [
      ...old,
      {
        id: `${messageId}`,
        message,
        sender: 'User'
      }
    ])

    const isFirstQuery =
      textmsgs.filter((msg) => msg.sender === 'Bot').length === 0

    const { response, actionsExecuted } = await handleUserInput(
      chatSession,
      Number(id),
      message,
      chatCoreInfo.diagnosis_id,
      isFirstQuery
    )

    const responseMsgId = await insertNewChatMessage(
      'Bot',
      response,
      Number(id)
    )

    if (!responseMsgId) {
      setToast('Failed storing AI answer!')
      return
    }

    setTextMsgs((old) => [
      ...old,
      {
        id: `${responseMsgId}`,
        message: response,
        sender: 'Bot'
      }
    ])

    if (actionsExecuted) {
      await fetchChatCoreInfo()
      await fetchChatMsgs()
    }

    setModelThinking(false)
    setFreshSession(false)
  }

  return (
    <div
      style={{
        height: '100vh'
      }}
    >
      {chatCoreInfo !== undefined && (
        <ChatSettingsPopup
          onClose={() => {
            setSettingsPopup(false)
          }}
          setChatCoreInfo={setChatCoreInfo}
          chatCoreInfo={chatCoreInfo!}
          open={settingsPopup}
        />
      )}
      <div
        id="scroll"
        style={{
          height: '84%',
          width: 'full',
          overflowY: 'scroll'
        }}
      >
        {textmsgs.map((msg) => {
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent:
                  msg.sender === 'User'
                    ? 'end'
                    : msg.sender === 'Bot'
                    ? 'start'
                    : 'center',
                borderRadius: '10px',
                padding: '5px',
                marginRight: '10px',
                marginLeft: '10px',
                width: 'fit'
              }}
            >
              <div
                className={
                  msg.sender === 'User'
                    ? 'userMessage'
                    : msg.sender === 'Bot'
                    ? 'botMessage'
                    : 'systemMessage'
                }
                style={{
                  borderRadius: '10px',
                  padding: '10px',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '85%',
                  wordWrap: 'break-word'
                }}
              >
                <span className="max-w-full break-words">{msg.message}</span>
              </div>
            </div>
          )
        })}
        {modelThinking && (
          <div
            key={'model-thinking'}
            style={{
              display: 'flex',
              justifyContent: 'start',
              borderRadius: '10px',
              padding: '5px',
              marginRight: '10px',
              marginLeft: '10px',
              width: 'fit'
            }}
          >
            <div
              className={'botMessage'}
              style={{
                borderRadius: '10px',
                padding: '10px',
                whiteSpace: 'pre-wrap',
                maxWidth: '85%',
                wordWrap: 'break-word' // or use overflowWrap
              }}
            >
              <span className="max-w-full break-words italic">
                {'Thinking...'}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 ml-2 w-full items-center justify-center flex">
        <button
          className="font-bold text-xl rounded-full justify-center items-center mr-2 h-[40px] min-w-[40px] flex bg-[#bfbfbf]"
          style={{
            fontWeight: 'bold',
            backgroundColor: modelThinking
              ? '#bfbfbf'
              : 'var(--usermessage-background-color)',
            color: 'var(--background-color)'
          }}
          onClick={() => {
            setSettingsPopup(true)
          }}
          disabled={modelThinking}
        >
          <SettingsIcon />
        </button>
        <textarea
          className="textInput"
          style={{
            width: '85%',
            height: '40px',
            borderRadius: '10px',
            paddingLeft: '10px',
            paddingTop: '5px',
            fontSize: '20px',
            resize: 'none'
          }}
          placeholder="Input..."
          value={inputValue}
          disabled={modelThinking}
          onChange={(e) => {
            setInputValue(e.currentTarget.value)
          }}
        />
        <button
          className="font-bold text-xl rounded-full justify-center items-center ml-2 mr-4 h-[40px] min-w-[40px] flex bg-[#bfbfbf]"
          style={{
            fontWeight: 'bold',
            backgroundColor: modelThinking
              ? '#bfbfbf'
              : 'var(--usermessage-background-color)',
            color: 'var(--background-color)'
          }}
          onClick={() => {
            if (!inputValue || inputValue.length === 0) return
            handleMessageSend(inputValue)
            setInputValue('')
          }}
          disabled={modelThinking}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
