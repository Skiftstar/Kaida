import type { Embedding } from '~/types'
import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
import { deleteUserEmbedding } from '~/util/Api'
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
  const [actionPending, setActionPending] = useState(false)

  const handleEmbeddingDelete = async (embeddingId: number) => {
    setActionPending(true)
    const isDeleted = await deleteUserEmbedding(embeddingId)

    if (!isDeleted) return //TODO: Error Handling

    refetch()
    setActionPending(false)
  }

  const handleCreateNew = async (e: FormEvent) => {}

  const handleClose = async (refresh?: boolean) => {
    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5 overflow-hidden">
        <div className="font-bold text-2xl">Knowledge about you</div>
        <div className="flex flex-col gap-2 overflow-y-scroll divide-y justify-center w-full">
          {embeddings.map((embedding) => {
            return (
              <div className="flex gap-2 items-center pb-1 px-1">
                <span>{embedding.text}</span>
                <button
                  disabled={actionPending}
                  onClick={() => {
                    handleEmbeddingDelete(embedding.id)
                  }}
                  className="ml-auto mr-5 cursor-pointer p-[2px] !text-red-700"
                >
                  X
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Popup>
  )
}
