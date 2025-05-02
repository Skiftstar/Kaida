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
          onClose={(refresh: boolean) => {
            setPopopOpen(false)
            setSelectedPresc(undefined)
            if (refresh) fetchPrescriptions()
          }}
          open={popupOpen}
          selectedPresc={selectedPresc}
        />
      )}

      <div className="flex flex-col m-4">
        {prescriptions.map((presc) => {
          // const date = formatDate(new Date(chat.timestamp))
          // const date = "";
          const startDate = new Date(presc.startDate)
          const endDate = new Date(presc.endDate)
          return (
            <button
              style={{ width: '100%' }}
              key={presc.id}
              onClick={() => {
                setSelectedPresc(presc)
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
                    {presc.medName}
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
                    {presc.dose}
                    {presc.doseUnit} every {presc.interval} {presc.intervalUnit}
                  </span>
                  <span
                    style={{
                      color: '#888',
                      marginLeft: '10px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {startDate.toLocaleDateString()} -{' '}
                    {endDate.toLocaleDateString()}
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
