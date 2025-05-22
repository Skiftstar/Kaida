import { Popup } from '../Popup'
import { useState, type FormEvent } from 'react'
import {
  PrescriptionDoseUnit,
  PrescriptionIntervalUnit,
  type Prescription
} from '~/types'
import DatePicker from 'react-datepicker'
import {
  createPrescription,
  deletePrescription,
  updatePrescription
} from '~/util/Api'
import { useToast } from '~/contexts/ToastContext'

export function MedicationPopup({
  open,
  onClose,
  selectedPresc
}: {
  open: boolean
  onClose: (refresh: boolean) => void
  selectedPresc: Prescription | undefined
}) {
  const [medName, setMedName] = useState(selectedPresc?.medName ?? '')
  const [dose, setDose] = useState(selectedPresc?.dose ?? 1)
  const [doseUnit, setDoseUnit] = useState(
    selectedPresc?.doseUnit ?? PrescriptionDoseUnit.MG
  )
  const [interval, setInterval] = useState(selectedPresc?.interval ?? 1)
  const [intervalUnit, setIntervalUnit] = useState(
    selectedPresc?.intervalUnit ?? PrescriptionIntervalUnit.DAYS
  )
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(selectedPresc?.startDate ?? Date.now())
  )
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(selectedPresc?.endDate ?? Date.now())
  )
  const [actionPending, setActionPending] = useState(false)

  const { setToast } = useToast()

  const handleMedicationDelete = async () => {
    if (!selectedPresc) return

    setActionPending(true)
    const isDeleted = await deletePrescription(selectedPresc.id)
    setActionPending(false)

    if (!isDeleted) {
      setToast('Failed deleting Prescription!')
      return
    }

    selectedPresc = undefined
    handleClose(true)
  }

  const handleCreateNew = async (e: FormEvent) => {
    e.preventDefault()
    if (endDate!.getTime() < startDate!.getTime()) {
      setToast('Start Date has to be before End Date!')
      return
    }

    setActionPending(true)

    const id = await createPrescription(
      medName,
      startDate!.toISOString(),
      endDate!.toISOString(),
      dose,
      doseUnit,
      interval,
      intervalUnit
    )

    setActionPending(false)
    if (!id) {
      setToast('Failed creating Prescription!')
      return
    }

    handleClose(true)
  }

  const handleClose = async (refresh?: boolean) => {
    if (selectedPresc) {
      if (endDate!.getTime() < startDate!.getTime()) {
        setToast('Start Date has to be before End Date!')
        return
      }

      refresh = true
      setActionPending(true)
      const isUpdated = await updatePrescription(
        selectedPresc.id,
        medName,
        startDate!.toISOString(),
        endDate!.toISOString(),
        dose,
        doseUnit,
        interval,
        intervalUnit
      )

      setActionPending(false)
      if (!isUpdated) {
        setToast('Failed updating Prescription!')
        return
      }
    }

    onClose(refresh ?? false)
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5">
        <form className="flex flex-col gap-6" onSubmit={handleCreateNew}>
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Medication</span>
            <input
              type="text"
              className="textInput p-2 w-full rounded !text-xl"
              placeholder="Medication..."
              required={true}
              onChange={(e) => {
                const value = e.currentTarget.value.trim()
                setMedName(value)
              }}
              value={medName}
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Dose</span>
            <div className="flex gap-2">
              <input
                className="resize-none w-full textInput rounded !text-xl p-2"
                value={dose}
                type="number"
                required={true}
                placeholder="Amount..."
                onChange={(e) => {
                  const value = Number(e.currentTarget.value)
                  setDose(value < 0 ? 0 : value)
                }}
              />
              <select
                className="textInput p-2 rounded"
                value={doseUnit}
                onChange={(e) => {
                  setDoseUnit(e.target.value as PrescriptionDoseUnit)
                }}
              >
                {Object.entries(PrescriptionDoseUnit).map(([key, val]) => (
                  <option key={key} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Every</span>
            <div className="flex gap-2">
              <input
                className="resize-none w-full textInput rounded !text-xl p-2"
                value={interval}
                type="number"
                required={true}
                placeholder="Amount..."
                onChange={(e) => {
                  const value = Number(e.currentTarget.value)
                  setInterval(value < 0 ? 0 : value)
                }}
              />
              <select
                className="textInput p-2 rounded"
                value={intervalUnit}
                onChange={(e) => {
                  setIntervalUnit(e.target.value as PrescriptionIntervalUnit)
                }}
              >
                {Object.entries(PrescriptionIntervalUnit).map(([key, val]) => (
                  <option key={key} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">Start Date</span>
            <div className="flex gap-2 w-full">
              <DatePicker
                className="w-full textInput !text-2xl p-2"
                selected={startDate}
                required={true}
                onChange={(date) => setStartDate(date)}
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold text-2xl">End Date</span>
            <div className="flex gap-2 w-full">
              <DatePicker
                className="w-full textInput !text-2xl p-2"
                selected={endDate}
                required={true}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>

          {selectedPresc ? (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-2xl">Danger Zone</span>
              <button
                onClick={handleMedicationDelete}
                style={{
                  backgroundColor: actionPending ? '#bfbfbf !important' : ''
                }}
                disabled={actionPending}
                className="bg-red-500 font-bold rounded p-2"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="w-full">
              <button
                type="submit"
                disabled={actionPending}
                style={{
                  backgroundColor: actionPending ? '#bfbfbf !important' : ''
                }}
                className="w-full bg-green-500 font-bold h-12 text-white pointer-events-auto"
              >
                Create
              </button>
            </div>
          )}
        </form>
      </div>
    </Popup>
  )
}
