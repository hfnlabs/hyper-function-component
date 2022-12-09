import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { Toast } from '@/components/Toast'

export const usePropTypes = createGlobalState(
  () => {
    const propTypes = ref<string>('')

    async function fetchPropTypes() {
      const res = await fetch('/api/props')
        .then(res => res.json())
      propTypes.value = res.content
    }

    async function updatePropTypes(content: string) {
      const res = await fetch('/api/props', { method: 'POST', body: JSON.stringify({ content }) }).then(res => res.json())
      if (res.err === 'OK')
        propTypes.value = content

      else Toast.error('update propTypes failed')
    }

    function checkPropTypes(content: string) {
      return fetch('/api/props/check', { method: 'POST', body: JSON.stringify({ content }) }).then(res => res.json())
    }

    return { propTypes, fetchPropTypes, updatePropTypes, checkPropTypes }
  },
)
