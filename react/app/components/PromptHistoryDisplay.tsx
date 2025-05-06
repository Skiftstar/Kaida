import { useEffect, useState } from 'react'
import type { PromptHistoryMessage } from '~/types'
import { fetchPromptHistory } from '~/util/Api'

export function PromptHistoryDisplay({ chatId }: { chatId: number }) {
  const [messages, setMessages] = useState<PromptHistoryMessage[]>([])

  useEffect(() => {
    handleFetchPromptHistory()
  }, [])

  const handleFetchPromptHistory = async () => {
    const messages = await fetchPromptHistory(chatId)

    if (!messages) return //TODO: Error handling

    setMessages(messages)
  }

  return (
    <div className="flex gap-2 flex-col w-full">
      {messages.map((message) => {
        return (
          <div
            style={{
              borderRadius: '10px',
              padding: '10px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            className={
              message.sender === 'Bot' ? 'botMessage' : 'systemMessage'
            }
          >
            <span>{message.sender}:</span>
            <br />
            <span className="w-full">{message.prompt}</span>
          </div>
        )
      })}
    </div>
  )
}
