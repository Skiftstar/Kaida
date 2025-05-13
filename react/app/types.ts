export type User = {
  username: string
  userId: string
  email: string
  push_notifications_enabled: boolean
}

export type PromptHistoryMessage = {
  id: number
  sender: 'System' | 'Bot'
  prompt: string
  created_at: number
}

export type Embedding = {
  id: number
  text: string
}

export type Action = {
  action: ActionNames
  params: {
    [paramName: string]: any
  }
}

export enum ActionNames {
  SESSION_CREATE = 'Session_create',
  DIAGNOSIS_CHANGE = 'Diagnosis_change'
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

export type Session = {
  id: number
  time: number
  diagnosisId: number
  title: string
  reason: string
}

export type Diagnosis = {
  id: number
  title: string
  summary: string
  created_at: number
  updated_at: number
}
