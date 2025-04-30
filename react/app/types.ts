export type User = {
  username: string
  userId: string
  email: string
  push_notifications_enabled: boolean
}

export type Chat = {
  id: number
  title: string
  latest_message: string
  timestamp: number
}

export type ChatInfo = {
  id: number
  title: string
  summary: string
  diagnosis_id: number
}

export type Message = {
  id: string
  message: string
  sender: string
}

export type Prescription = {
  id: number
  dose: number
  doseUnit: PrescriptionDoseUnit
  interval: number
  intervalUnit: PrescriptionIntervalUnit
  medName: string
  startDate: number
  endDate: number
}

export enum PrescriptionDoseUnit {
  MG = 'mg',
  ML = 'ml'
}

export enum PrescriptionIntervalUnit {
  DAYS = 'days',
  HOURS = 'hours',
  MINUTES = 'minutes'
}
