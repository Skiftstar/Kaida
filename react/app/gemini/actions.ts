import { ActionNames, type Action } from '~/types'
import {
  createSession,
  insertNewChatMessage,
  updateDiagnosis
} from '~/util/Api'

type DiagnosisChangeParams = {
  title: string
  summary: string
}

type SessionCreateParams = {
  title: string
  reason: string
  date: string
}

export const handleActions = async (
  actions: Action[],
  diagnosisId: number,
  chatId: number
) => {
  actions.forEach((action) => {
    switch (action.action) {
      case ActionNames.DIAGNOSIS_CHANGE:
        handleDiagnosisChange(
          action.params as DiagnosisChangeParams,
          diagnosisId
        )
        break
      case ActionNames.SESSION_CREATE:
        handleSessionCreate(
          action.params as SessionCreateParams,
          diagnosisId,
          chatId
        )
        break
    }
  })
}

const handleDiagnosisChange = async (
  params: DiagnosisChangeParams,
  diagnosisId: number
) => {
  const isUpdated = await updateDiagnosis(
    diagnosisId,
    params.title,
    params.summary,
    false,
    false
  )

  if (!isUpdated) return //TODO: error handling
}

const handleSessionCreate = async (
  params: SessionCreateParams,
  diagnosisId: number,
  chatId: number
) => {
  const id = await createSession(
    params.title,
    params.date,
    params.reason,
    diagnosisId
  )

  if (!id) return //TODO: error handling

  const msgId = await insertNewChatMessage(
    'System',
    `Created new Session "${params.title}"

	Reason: "${params.reason}"

	Date: ${params.date}`,
    chatId
  )

  if (!msgId) return //TODO: error handling
}
