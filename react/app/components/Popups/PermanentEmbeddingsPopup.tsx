import type { Embedding } from '~/types'
import { Popup } from '../Popup'
import {
  deleteUserEmbedding,
  insertSingleUserEmbedding,
  updateUserEmbedding
} from '~/util/Api'
import { useToast } from '~/contexts/ToastContext'
import { EmbeddingsDisplay } from '../EmbeddingsDisplay'

export function PermanentEmbeddingsPopup({
  open,
  onClose,
  embeddings,
  refetch
}: {
  open: boolean
  onClose: (refresh: boolean) => void
  embeddings: Embedding[]
  refetch: () => void
}) {
  const { setToast } = useToast()

  const handleEmbeddingDelete = async (embeddingId: number) => {
    const isDeleted = await deleteUserEmbedding(embeddingId)

    if (!isDeleted) {
      setToast('Error deleting Embedding!')
      return false
    }

    refetch()
    return true
  }

  const handleEmbeddingEdit = async (
    newEmbedding: string,
    embeddingId: number
  ) => {
    const isUpdated = await updateUserEmbedding(
      embeddingId,
      newEmbedding.trim()
    )

    if (!isUpdated) {
      setToast('Error updating Embedding!')
      return false
    }

    refetch()
    return true
  }

  const handleEmbeddingCreate = async (embedding: string) => {
    const id = await insertSingleUserEmbedding(embedding.trim())

    if (!id) {
      setToast('Error creating Embedding!')
      return false
    }

    refetch()
    return true
  }

  const handleClose = async (refresh?: boolean) => {
    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5 overflow-hidden">
        <div className="font-bold text-2xl">Knowledge about you</div>
        <EmbeddingsDisplay
          embeddings={embeddings}
          onCreate={handleEmbeddingCreate}
          onEdit={handleEmbeddingEdit}
          onDelete={handleEmbeddingDelete}
        />
      </div>
    </Popup>
  )
}
