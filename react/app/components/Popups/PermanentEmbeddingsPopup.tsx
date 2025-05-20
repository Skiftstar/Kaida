import type { Embedding } from '~/types'
import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
import { deleteUserEmbedding } from '~/util/Api'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import DoneIcon from '@mui/icons-material/Done'

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
  const [currentEditId, setCurrentEditId] = useState<number | undefined>(
    undefined
  )

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
                {currentEditId === embedding.id ? (
                  <input
                    className="textInput p-2 rounded w-full h-[20px] !text-lg"
                    value={embedding.text}
                  />
                ) : (
                  <span>{embedding.text}</span>
                )}
                {currentEditId === embedding.id ? (
                  <div className="ml-auto flex">
                    <button className="text-green-700">
                      <DoneIcon />
                    </button>
                    <button
                      className="mr-5 !text-red-700"
                      onClick={() => {
                        setCurrentEditId(undefined)
                      }}
                    >
                      <ClearIcon />
                    </button>
                  </div>
                ) : (
                  <div className="ml-auto flex">
                    <button
                      onClick={() => {
                        setCurrentEditId(embedding.id)
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      disabled={actionPending}
                      onClick={() => {
                        handleEmbeddingDelete(embedding.id)
                      }}
                      className="mr-5 !text-red-700"
                    >
                      <ClearIcon />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Popup>
  )
}
