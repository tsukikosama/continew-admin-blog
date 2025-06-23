import { reactive } from 'vue'
import { cloneDeep } from 'lodash-es'

export function useResetReactive<T extends object>(value: T) {
  const getInitValue = () => cloneDeep(value)

  const state = reactive(getInitValue())

  const reset = () => {
    Object.keys(state).forEach((key) => delete state[key])
    Object.assign(state, getInitValue())
  }

  return [state, reset] as const
}
