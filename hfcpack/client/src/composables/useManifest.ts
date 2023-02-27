import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { Toast } from '@/components/Toast'

export const useManifest = createGlobalState(
  () => {
    const manifest = ref<HfcManifest>()
    async function fetchManifest() {
      const res = await fetch('/api/manifest')
        .then(res => res.json())
      manifest.value = res
    }

    async function updateManifest(key: string, value: any) {
      const res = await fetch('/api/manifest', { method: 'POST', body: JSON.stringify({ key, value }) }).then(res => res.json())
      if (res.err === 'OK')
        location.reload()

      else Toast.error(`update ${key} failed`)
    }

    fetchManifest()

    return { manifest, fetchManifest, updateManifest }
  },
)
