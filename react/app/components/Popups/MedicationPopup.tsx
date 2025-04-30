import { Popup } from '../Popup'
import { useState } from 'react'
import {
  PrescriptionDoseUnit,
  PrescriptionIntervalUnit,
  type Prescription
} from '~/types'

export function MedicationPopup({
  open,
  onClose,
  selectedPresc
}: {
  open: boolean
  onClose: () => void
  selectedPresc: Prescription | undefined
}) {
  const [medName, setMedName] = useState(selectedPresc?.medName ?? '')
  const [dose, setDose] = useState(selectedPresc?.dose ?? 0)
  const [doseUnit, setDoseUnit] = useState(
    selectedPresc?.doseUnit ?? PrescriptionDoseUnit.MG
  )
  const [interval, setInterval] = useState(selectedPresc?.interval ?? 0)
  const [intervalUnit, setIntervalUnit] = useState(
    selectedPresc?.intervalUnit ?? PrescriptionIntervalUnit.DAYS
  )
  const [actionPending, setActionPending] = useState(false)

  const handleMedicationDelete = async () => {}

  const handleClose = async () => {
    onClose()
  }

  return (
    <Popup open={open} onClose={handleClose}>
      <div className="flex flex-col gap-6 mt-2 px-5">
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold text-2xl">Medication</span>
          <input
            type="text"
            className="textInput p-2 w-full rounded !text-xl"
            placeholder="Medication..."
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
              placeholder="Amount..."
              onChange={(e) => {
                const value = Number(e.currentTarget.value)
                setDose(value)
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
              placeholder="Amount..."
              onChange={(e) => {
                const value = Number(e.currentTarget.value)
                setInterval(value)
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
        <div className="flex flex-col gap-2">
          <span className="font-bold text-2xl">Danger Zone</span>
          <button
            onClick={handleMedicationDelete}
            disabled={actionPending}
            className="bg-red-500 font-bold rounded p-2"
          >
            Delete
          </button>
        </div>
      </div>
    </Popup>
  )
}
