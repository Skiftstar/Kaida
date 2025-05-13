import type { Embedding } from '~/types'
import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
export function PermanentEmbeddingsPopup({
  open,
  onClose,
  embeddings
}: {
  open: boolean
  onClose: (refresh: boolean) => void
  embeddings: Embedding[]
}) {
  const [actionPending, setActionPending] = useState(false)

  const handleEmbeddingDelete = async () => {}

  const handleCreateNew = async (e: FormEvent) => {}

  const handleClose = async (refresh?: boolean) => {
    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5">
        {embeddings.map((embedding) => {
          return (
            <div>
              <span>{embedding.text}</span>
            </div>
          )
        })}
      </div>
    </Popup>
  )
}
