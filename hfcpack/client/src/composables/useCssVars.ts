import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useCssVars = createGlobalState(
  () => {
    const cssVars = ref<string>('')

    async function fetchCssVars() {
      const res = await fetch('/api/cssvars')
        .then(res => res.json())
      cssVars.value = res.content
    }

    async function updateCssVars(content: string) {
      const res = await fetch('/api/cssvars', { method: 'POST', body: JSON.stringify({ content }) }).then(res => res.json())
      if (res.err === 'OK')
        cssVars.value = content

      return res
    }

    return { cssVars, fetchCssVars, updateCssVars }
  },
)
