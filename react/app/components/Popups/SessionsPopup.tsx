import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
import { type Diagnosis, type Session } from '~/types'
import DatePicker from 'react-datepicker'
import { createSession, deleteSession, updateSession } from '~/util/Api'
import { useToast } from '~/contexts/ToastContext'

export function SessionsPopup({
  open,
  onClose,
  availableDiagnoses,
  selectedSession
}: {
  open: boolean
  onClose: (refresh: boolean) => void
  availableDiagnoses: Diagnosis[]
  selectedSession: Session | undefined
}) {
  const [title, setTitle] = useState(selectedSession?.title ?? '')
  const [reason, setReason] = useState(selectedSession?.reason ?? '')
  const [diagnosisId, setDiagnosisId] = useState<number | undefined>(
    selectedSession?.diagnosisId ?? undefined
  )
  const [time, setTime] = useState<Date | null>(
    new Date(selectedSession?.time ?? Date.now())
  )
  const [actionPending, setActionPending] = useState(false)

  const { setToast } = useToast()

  const handleSessionDelete = async () => {
    if (!selectedSession) return

    setActionPending(true)
    const isDeleted = await deleteSession(selectedSession.id)

    setActionPending(false)
    if (!isDeleted) {
      setToast('Failed deleting Session!')
      return
    }

    selectedSession = undefined
    handleClose(true)
  }

  const handleCreateNew = async (e: FormEvent) => {
    e.preventDefault()
    setActionPending(true)

    const id = await createSession(
      title,
      time!.toISOString(),
      reason,
      diagnosisId
    )

    setActionPending(false)
    if (!id) {
      setToast('Failed creating Session!')
      return
    }

    handleClose(true)
  }

  const handleClose = async (refresh?: boolean) => {
    if (selectedSession) {
      refresh = true
      setActionPending(true)
      const isUpdated = await updateSession(
        selectedSession.id,
        title,
        time!.toLocaleString(),
        reason,
        diagnosisId
      )
      setActionPending(false)
      if (!isUpdated) {
        setToast('Failed editing Session!')
        return
      }
    }

    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5">
        <form className="flex flex-col gap-6" onSubmit={handleCreateNew}>
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Title</span>
            <input
              type="text"
              className="textInput p-2 w-full rounded !text-xl"
              placeholder="Title..."
              required={true}
              onChange={(e) => {
                const value = e.currentTarget.value.trim()
                setTitle(value)
              }}
              value={title}
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Reason</span>
            <div className="flex gap-2">
              <input
                className="resize-none w-full textInput rounded !text-xl p-2"
                value={reason}
                type="text"
                required={true}
                placeholder="Reason..."
                onChange={(e) => {
                  const value = e.currentTarget.value.trim()
                  setReason(value)
                }}
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Linked Diagnosis</span>
            <div className="flex gap-2">
              <select
                className="textInput p-2 rounded w-full text-xl"
                value={diagnosisId}
                onChange={(e) => {
                  setDiagnosisId(
                    isNaN(e.target.value) ? undefined : Number(e.target.value)
                  )
                }}
              >
                <option key={'diagnId-None'} value={undefined}>
                  {'-'}
                </option>
                {availableDiagnoses.map((diagn) => (
                  <option key={diagn.id} value={diagn.id}>
                    {diagn.id} - {diagn.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Time</span>
            <div className="flex gap-2 w-full">
              <DatePicker
                className="w-full textInput !text-2xl p-2"
                selected={time}
                required={true}
                onChange={(date) => setTime(date)}
                showTimeSelect
                dateFormat="MM/dd/yy h:mm aa"
                placeholderText="MM/dd/yy h:mm aa"
              />
            </div>
          </div>

          {selectedSession ? (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-2xl">Danger Zone</span>
              <button
                onClick={handleSessionDelete}
                style={{
                  backgroundColor: actionPending ? '#bfbfbf !important' : ''
                }}
                disabled={actionPending}
                className="bg-red-500 font-bold rounded p-2"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="w-full">
              <button
                type="submit"
                disabled={actionPending}
                style={{
                  backgroundColor: actionPending ? '#bfbfbf !important' : ''
                }}
                className="w-full bg-green-500 font-bold h-12 text-white pointer-events-auto"
              >
                Create
              </button>
            </div>
          )}
        </form>
      </div>
    </Popup>
  )
}
