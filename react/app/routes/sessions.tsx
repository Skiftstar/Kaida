import { useEffect, useState } from 'react'
import { SessionsPopup } from '~/components/Popups/SessionsPopup'
import { usePage } from '~/contexts/PageContext'
import { useToast } from '~/contexts/ToastContext'
import type { Diagnosis, Session } from '~/types'
import { getRecentDiagnoses, getUserSessions } from '~/util/Api'

export default function SessionsRoute() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(
    undefined
  )
  const [userDiagnoses, setUserDiagnoses] = useState<Diagnosis[]>([])
  const [popupOpen, setPopopOpen] = useState(false)

  useEffect(() => {
    fetchAllDiagnoses()
    fetchSessions()
  }, [])

  const { setCurrPage } = usePage()
  const { setToast } = useToast()
  setCurrPage('Sessions')

  const fetchSessions = async () => {
    const sessions = await getUserSessions()

    if (!sessions) {
      setToast('Failed fetching Sessions!')
      return
    }

    setSessions(sessions)
  }

  const fetchAllDiagnoses = async () => {
    const diagnoses = await getRecentDiagnoses(-1) //-1 to fetch all

    if (!diagnoses) {
      setToast('Failed fetching Diagnosis Data!')
      return
    }

    diagnoses.sort((a, b) => a.id - b.id)

    setUserDiagnoses(diagnoses)
  }

  const handleCreateNew = () => {
    setPopopOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      {popupOpen && (
        <SessionsPopup
          onClose={(refresh: boolean) => {
            setPopopOpen(false)
            setSelectedSession(undefined)
            if (refresh) fetchSessions()
          }}
          open={popupOpen}
          availableDiagnoses={userDiagnoses}
          selectedSession={selectedSession}
        />
      )}

      <div className="flex flex-col m-4">
        {sessions.map((session) => {
          const time = new Date(session.time)
          return (
            <button
              style={{ width: '100%' }}
              key={session.id}
              onClick={() => {
                setSelectedSession(session)
                setPopopOpen(true)
              }}
            >
              <div
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                  margin: '10px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {session.title}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span
                    style={{
                      display: 'block',
                      color: '#888',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'start'
                    }}
                  >
                    {session.reason}
                  </span>
                  <span
                    style={{
                      color: '#888',
                      marginLeft: '10px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {time.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="w-full mt-auto">
        <button
          onClick={handleCreateNew}
          className="w-full bg-green-500 font-bold h-12 text-white pointer-events-auto"
        >
          Create
        </button>
      </div>
    </div>
  )
}
