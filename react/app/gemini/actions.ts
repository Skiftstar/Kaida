import { ActionNames, type Action } from '~/types'
import { updateDiagnosis } from '~/util/Api'

type DiagnosisChangeAction = {
  action: string
  params: {
    title: string
    summary: string
  }
}

export const handleActions = async (actions: Action[], diagnosisId: number) => {
  actions.forEach((action) => {
    switch (action.action) {
      case ActionNames.DIAGNOSIS_CHANGE:
        handleDiagnosisChange(action as DiagnosisChangeAction, diagnosisId)
        break
    }
  })
}

const handleDiagnosisChange = async (
  action: DiagnosisChangeAction,
  diagnosisId: number
) => {
  const isUpdated = await updateDiagnosis(
    diagnosisId,
    action.params.title,
    action.params.summary,
    false,
    false
  )

  if (!isUpdated) return //TODO: error handling
}
