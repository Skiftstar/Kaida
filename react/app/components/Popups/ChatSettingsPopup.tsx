import { useNavigate, useParams } from 'react-router'
import { Popup } from '../Popup'
import { deleteDiagnosis, updateDiagnosis } from '~/util/Api'
import type { ChatInfo } from '~/types'
import { useEffect, useState } from 'react'
import { PromptHistoryDisplay } from '../PromptHistoryDisplay'
import { useToast } from '~/contexts/ToastContext'

export function ChatSettingsPopup({
  open,
  onClose,
  chatCoreInfo,
  setChatCoreInfo
}: {
  open: boolean
  onClose: () => void
  chatCoreInfo: ChatInfo
  setChatCoreInfo: (info: ChatInfo) => void
}) {
  const [title, setTitle] = useState(chatCoreInfo.title)
  const [summary, setSummary] = useState(chatCoreInfo.summary)
  const [showPromptHistory, setShowPromptHistory] = useState(false)
  const [showEmbeddings, setShowEmbeddings] = useState(false)
  const [actionPending, setActionPending] = useState(false)

  useEffect(() => {
    setTitle(chatCoreInfo.title)
    setSummary(chatCoreInfo.summary)
  }, [chatCoreInfo])

  const { setToast } = useToast()
  const nav = useNavigate()

  const handleDeleteChat = async () => {
    setActionPending(true)
    const isDeleted = await deleteDiagnosis(chatCoreInfo.id)

    setActionPending(false)
    if (!isDeleted) {
      setToast('Failed deleting Chat!')
      return
    }

    nav('/')
  }

  const handleClose = async () => {
    const titleCustom = title !== chatCoreInfo.title
    const summaryCustom = summary !== chatCoreInfo.summary

    if (titleCustom || summaryCustom) {
      setActionPending(true)
      const wasUpdated = await updateDiagnosis(
        chatCoreInfo.diagnosis_id,
        title,
        summary,
        titleCustom,
        summaryCustom
      )
      setActionPending(false)

      if (!wasUpdated) {
        setToast('Failed editing Chat!')
        return
      }
      setChatCoreInfo({ ...chatCoreInfo, title, summary })
    }

    onClose()
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5">
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold text-2xl">Title</span>
          <input
            type="text"
            className="textInput p-2 w-full rounded !text-xl"
            placeholder="Title..."
            onChange={(e) => {
              const value = e.currentTarget.value.trim()
              setTitle(value)
            }}
            value={title}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold text-2xl">Summary</span>
          <textarea
            className="resize-none w-full textInput rounded !text-xl p-2 h-[200px]"
            value={summary}
            placeholder="Diagnosis..."
            onChange={(e) => {
              const value = e.currentTarget.value.trim()
              setSummary(value)
            }}
          />
          <span className="text-xs italic">
            *Manually changing title or summary will prevent our AI from making
            automated changes, which might impact your experience
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-2xl">Debugging Zone</span>
          <button
            onClick={() => {
              setShowPromptHistory(!showPromptHistory)
            }}
            className="bg-[var(--usermessage-background-color)] font-bold rounded p-2"
            disabled={actionPending}
          >
            {showPromptHistory ? 'Hide' : 'Show'} Prompt History
          </button>
          {showPromptHistory && (
            <PromptHistoryDisplay chatId={chatCoreInfo.id} />
          )}
          <button
            onClick={() => {
              setShowEmbeddings(!showEmbeddings)
            }}
            className="bg-[var(--usermessage-background-color)] font-bold rounded p-2"
            disabled={actionPending}
          >
            {showEmbeddings ? 'Hide' : 'Show'} Diagnosis Embeddings
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-2xl">Danger Zone</span>
          <button
            onClick={handleDeleteChat}
            disabled={actionPending}
            className="bg-red-500 font-bold rounded p-2"
          >
            Delete Chat
          </button>
        </div>
      </div>
    </Popup>
  )
}
