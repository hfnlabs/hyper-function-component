import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useImagePicker = createGlobalState(
  () => {
    const showImagePicker = ref(false)

    let selectImgCallback: (imgPath: string) => void
    function onSelectImg(cb: (imgPath: string) => void) {
      selectImgCallback = cb
    }

    function selectImg(imgPath: string) {
      selectImgCallback?.(imgPath)
    }

    return { showImagePicker, onSelectImg, selectImg }
  })
