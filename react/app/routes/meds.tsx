import { useEffect, useState } from 'react'
import { MedicationPopup } from '~/components/Popups/MedicationPopup'
import { usePage } from '~/contexts/PageContext'
import type { Prescription } from '~/types'
import { getUserPrescriptions } from '~/util/Api'

export default function MedsRoute() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedPresc, setSelectedPresc] = useState<Prescription | undefined>(
    undefined
  )
  const [popupOpen, setPopopOpen] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const { setCurrPage } = usePage()
  setCurrPage('Medication')

  const fetchPrescriptions = async () => {
    const prescriptions = await getUserPrescriptions()

    if (!prescriptions) return //TODO: Error handling

    setPrescriptions(prescriptions)
  }

  const handleCreateNew = () => {
    setPopopOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      {popupOpen && (
        <MedicationPopup
          onClose={() => {
            setPopopOpen(false)
          }}
          open={popupOpen}
          selectedPresc={selectedPresc}
        />
      )}

      <div className="flex flex-col gap-6 m-4"></div>

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
