import type { Embedding } from '~/types'
import { useState, type FormEvent } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import DoneIcon from '@mui/icons-material/Done'
import AddIcon from '@mui/icons-material/Add'

export function EmbeddingsDisplay({
  embeddings,
  onCreate,
  onDelete,
  onEdit
}: {
  embeddings: Embedding[]
  onCreate: (input: string) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
  onEdit: (input: string, id: number) => Promise<boolean>
}) {
  const [actionPending, setActionPending] = useState(false)
  const [currentEditId, setCurrentEditId] = useState<number | undefined>(
    undefined
  )
  const [currEditText, setCurrEditText] = useState('')
  const [addingNew, setAddingNew] = useState(false)

  const handleEmbeddingDelete = async (embeddingId: number) => {
    setActionPending(true)
    await onDelete(embeddingId)
    setActionPending(false)
  }

  const handleEmbeddingEdit = async (embeddingId: number) => {
    setActionPending(true)
    const isEdited = await onEdit(currEditText, embeddingId)
    if (isEdited) {
      setCurrEditText('')
      setCurrentEditId(undefined)
    }
    setActionPending(false)
  }

  const handleEmbeddingCreate = async (e: FormEvent) => {
    e.preventDefault()
    setActionPending(true)
    const isCreated = await onCreate(currEditText)
    if (isCreated) {
      setCurrEditText('')
      setAddingNew(false)
    }
    setActionPending(false)
  }

  return (
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
              setCurrEditText(e.currentTarget.value)
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
                  setCurrEditText(e.currentTarget.value)
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
  )
}
