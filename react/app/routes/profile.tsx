import { Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PermanentEmbeddingsPopup } from '~/components/Popups/PermanentEmbeddingsPopup'
import { usePage } from '~/contexts/PageContext'
import { useToast } from '~/contexts/ToastContext'
import { useUser } from '~/contexts/UserContext'
import type { Embedding } from '~/types'
import { fetchAllUserEmbeddings, logoutUser } from '~/util/Api'

export default function ProfileRoute() {
  const [embeddings, setEmbeddings] = useState<Embedding[] | undefined>(
    undefined
  )
  const [embeddingsPopupOpen, setEmbeddingsPopupOpen] = useState(false)
  const { user, setUser } = useUser()
  const { setToast } = useToast()
  const nav = useNavigate()

  const { setCurrPage } = usePage()
  setCurrPage('Profile')

  useEffect(() => {
    fetchEmbeddings()
  }, [])

  const fetchEmbeddings = async () => {
    const embeddings = await fetchAllUserEmbeddings()

    if (!embeddings) {
      setToast('Error fetching Embeddings!')
      return
    }

    setEmbeddings(embeddings)
  }

  const handleLogout = async () => {
    const successfulLogout = await logoutUser()
    if (successfulLogout) {
      nav('/login')
      setUser(undefined)
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      {embeddings && (
        <PermanentEmbeddingsPopup
          open={embeddingsPopupOpen}
          embeddings={embeddings}
          onClose={() => {
            setEmbeddingsPopupOpen(false)
          }}
          refetch={fetchEmbeddings}
        />
      )}

      <div className="flex flex-col gap-6 m-4">
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Email</span>
          </div>
          <span className="flex justify-center font-bold text-xl">
            {user?.email}
          </span>
        </div>
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Password</span>
          </div>
          <span className="flex justify-center font-bold text-xl">*******</span>
        </div>
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Push-Notifications</span>
          </div>
          <span className="flex justify-center font-bold text-xl">
            {user?.push_notifications_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Knowledge Base</span>
          </div>
          <span className="flex justify-center font-bold text-xl">
            {embeddings ? (
              <span
                onClick={() => {
                  setEmbeddingsPopupOpen(true)
                }}
                className="cursor-pointer"
              >{`${embeddings.length} Knowledge ${
                embeddings.length === 1 ? 'Entry' : 'Entries'
              }`}</span>
            ) : (
              <Skeleton className="w-1/2" />
            )}
          </span>
        </div>
      </div>

      <div className="w-full mt-auto">
        <button
          onClick={handleLogout}
          className="w-full font-bold h-12 bg-red-500 text-white pointer-events-auto"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
