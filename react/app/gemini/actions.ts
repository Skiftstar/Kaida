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
          diagnosisId,
          chatId
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
  diagnosisId: number,
  chatId: number
) => {
  const isUpdated = await updateDiagnosis(
    diagnosisId,
    params.title,
    params.summary,
    false,
    false
  )

  if (!isUpdated) {
    await insertNewChatMessage(
      'System',
      'Kaida tried updating your chat title/summary but ran into an error. If this error persists, please contact Support.',
      chatId
    )
  }
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

  if (!id) {
    await insertNewChatMessage(
      'System',
      `We tried creating a Session "${params.title}" for you on ${params.date}, but ran into an error. If this error persists, please contact Support.`,
      chatId
    )
    return
  }

  const msgId = await insertNewChatMessage(
    'System',
    `Created new Session "${params.title}"

	Reason: "${params.reason}"

	Date: ${params.date}`,
    chatId
  )

  if (!msgId) return //TODO: Would need error handling, but not sure how
}
