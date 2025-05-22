import type { Embedding } from '~/types'
import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
import {
  deleteUserEmbedding,
  insertSingleUserEmbedding,
  updateUserEmbedding
} from '~/util/Api'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import DoneIcon from '@mui/icons-material/Done'
import AddIcon from '@mui/icons-material/Add'
import { useToast } from '~/contexts/ToastContext'

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
  const [currEditText, setCurrEditText] = useState('')
  const [addingNew, setAddingNew] = useState(false)

  const { setToast } = useToast()

  const handleEmbeddingDelete = async (embeddingId: number) => {
    setActionPending(true)
    const isDeleted = await deleteUserEmbedding(embeddingId)

    if (!isDeleted) {
      setToast('Error deleting Embedding!')
      setActionPending(false)
      return
    }

    refetch()
    setActionPending(false)
  }

  const handleEmbeddingEdit = async (embeddingId: number) => {
    setActionPending(true)
    const isUpdated = await updateUserEmbedding(embeddingId, currEditText)

    if (!isUpdated) {
      setToast('Error updating Embedding!')
      setActionPending(false)
      return
    }

    refetch()
    setCurrEditText('')
    setCurrentEditId(undefined)
    setActionPending(false)
  }

  const handleEmbeddingCreate = async (e: FormEvent) => {
    e.preventDefault()
    setActionPending(true)
    const id = await insertSingleUserEmbedding(currEditText)

    if (!id) {
      setToast('Error creating Embedding!')
      setActionPending(false)
      return
    }

    refetch()
    setCurrEditText('')
    setAddingNew(false)
    setActionPending(false)
  }

  const handleClose = async (refresh?: boolean) => {
    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5 overflow-hidden">
        <div className="font-bold text-2xl">Knowledge about you</div>
        <div className="flex flex-col gap-2 overflow-y-scroll divide-y justify-center w-full">
          {addingNew ? (
            <form
              onSubmit={handleEmbeddingCreate}
              className="flex justify-center items-center pb-2"
            >
              <input
                className="textInput ml-1 mr-1 p-2 rounded w-full h-[20px] !text-lg"
                value={currEditText}
                required={true}
                onChange={(e) => {
                  setCurrEditText(e.currentTarget.value.trim())
                }}
              />
              <div className="ml-auto flex">
                <button
                  type="submit"
                  disabled={actionPending}
                  className="text-green-700"
                >
                  <DoneIcon />
                </button>
                <button
                  className="mr-5 text-red-700"
                  onClick={() => {
                    setAddingNew(false)
                    setCurrEditText('')
                  }}
                  disabled={actionPending}
                >
                  <ClearIcon />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setAddingNew(true)
                setCurrEditText('')
                setCurrentEditId(undefined)
              }}
              className="flex items-center pb-2 justify-center"
            >
              <AddIcon />
              <span>Add new Embedding</span>
            </button>
          )}
          {embeddings.map((embedding) => {
            return (
              <div className="flex gap-2 items-center pb-1 px-1">
                {currentEditId === embedding.id ? (
                  <input
                    className="textInput p-2 rounded w-full h-[20px] !text-lg"
                    value={currEditText}
                    onChange={(e) => {
                      setCurrEditText(e.currentTarget.value.trim())
                    }}
                  />
                ) : (
                  <span>{embedding.text}</span>
                )}
                {currentEditId === embedding.id ? (
                  <div className="ml-auto flex">
                    <button
                      onClick={() => {
                        handleEmbeddingEdit(embedding.id)
                      }}
                      disabled={actionPending}
                      className="text-green-700"
                    >
                      <DoneIcon />
                    </button>
                    <button
                      className="mr-5 text-red-700"
                      onClick={() => {
                        setCurrentEditId(undefined)
                      }}
                      disabled={actionPending}
                    >
                      <ClearIcon />
                    </button>
                  </div>
                ) : (
                  <div className="ml-auto flex">
                    <button
                      onClick={() => {
                        setCurrentEditId(embedding.id)
                        setCurrEditText(embedding.text)
                        setAddingNew(false)
                      }}
                      disabled={actionPending}
                    >
                      <EditIcon />
                    </button>
                    <button
                      disabled={actionPending}
                      onClick={() => {
                        handleEmbeddingDelete(embedding.id)
                      }}
                      className="mr-5 text-red-700"
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
