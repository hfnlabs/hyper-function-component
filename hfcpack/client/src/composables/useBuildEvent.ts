import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { listenBuildEvents } from '@/build-event-listener'

type Actions = '' | 'rebuild-complete'

export const useBuildEvent = createGlobalState(
  () => {
    const buildEvent = ref<{ action: Actions; payload: any }>({ action: '', payload: null })
    listenBuildEvents((data) => {
      buildEvent.value = {
        action: data.action as Actions,
        payload: data.payload,
      }
    })

    return { buildEvent }
  },
)
