import { useNavigate, useParams } from 'react-router'
import { Popup } from '../Popup'
import { deleteDiagnosis } from '~/util/Api'

export function ChatSettingsPopup({
  open,
  onClose,
  diagnosisId
}: {
  open: boolean
  onClose: () => void
  diagnosisId: number
}) {
  const { id } = useParams()

  const nav = useNavigate()

  const handleDeleteChat = async () => {
    const isDeleted = await deleteDiagnosis(id)

    if (!isDeleted) {
      //TODO: Error handling
      return
    }

    nav('/')
  }

  return (
    <Popup open={open} onClose={onClose}>
      <button onClick={handleDeleteChat} className="bg-red-500 rounded p-2">
        Delete Chat
      </button>
    </Popup>
  )
}
