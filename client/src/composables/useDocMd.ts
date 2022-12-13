import { ref } from 'vue'
import { createGlobalState, useDebounceFn } from '@vueuse/core'

export const useDocMd = createGlobalState(
  () => {
    let etag = ''
    const docMd = ref({ content: '' })
    async function fetchDocMd() {
      const res = await fetch('/api/doc').then(res => res.json())
      etag = res.etag
      docMd.value = { content: res.content }
    }

    async function updateDocMd(content: string) {
      const res = await fetch('/api/doc', { method: 'POST', body: JSON.stringify({ etag, content }) }).then(res => res.json())
      if (res.err === 'OK')
        etag = res.etag

      else
        location.reload()
    }

    fetchDocMd()

    return { docMd, fetchDocMd, updateDocMd: useDebounceFn(updateDocMd, 250) }
  },
)
