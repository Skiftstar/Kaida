import { useEffect, useState } from 'react'
import type { PromptHistoryMessage } from '~/types'
import { fetchPromptHistory } from '~/util/Api'

export function PromptHistoryDisplay({ chatId }: { chatId: number }) {
  const [messages, setMessages] = useState<PromptHistoryMessage[]>([])
  const [extendedElement, setExtendedElement] = useState<number | undefined>(
    undefined
  )

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
            className={` rounded p-4 wrap-break-word whitespace-pre-wrap
              ${message.sender === 'Bot' ? 'botMessage' : 'systemMessage'}
            `}
          >
            <span
              onClick={() => {
                setExtendedElement(
                  extendedElement === message.id ? undefined : message.id
                )
              }}
              className="cursor-pointer select-none"
            >
              {message.sender}:
            </span>
            <br />
            <span
              className="w-full inline-block overflow-hidden"
              style={extendedElement === message.id ? {} : { height: '100px' }}
            >
              {message.prompt}
            </span>
          </div>
        )
      })}
    </div>
  )
}
