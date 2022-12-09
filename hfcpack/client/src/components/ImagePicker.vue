<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import Compressor from 'compressorjs'
import Dialog from './Dialog.vue'
import { Toast } from './Toast'
import { useImagePicker } from '@/composables/useImagePicker'

const { showImagePicker, selectImg } = useImagePicker()

function handleSelectImg(imgPath: string) {
  selectImg(imgPath)
  showImagePicker.value = false
}

const imgs = ref<string[]>([])

const { copy } = useClipboard()
function copyImgPath(p: string) {
  copy(p)
  Toast.success('Copied to clipboard')
}

onMounted(() => {
  fetchImgs()
})

function fetchImgs() {
  fetch('/api/img/all').then(res => res.json()).then((data) => {
    imgs.value = data.imgs
  })
}

function uploadImage(file: File | Blob) {
  const formData = new FormData()
  formData.append('img', file)

  fetch('/api/img/upload', { method: 'POST', body: formData })
    .then(res => res.json())
    .then((res) => {
      if (res.err !== 'OK') {
        Toast.error(res.errmsg)
        return
      }

      fetchImgs()
      Toast.success('upload success')
    })
}

function handleUploadImage(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files.length)
    return

  const file = target.files![0]
  if (file.size > 1024 * 128 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    // eslint-disable-next-line no-new
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 1280,
      mimeType: 'image/webp',
      success(result) {
        uploadImage(result)
      },
      error(err) {
        Toast.error(err.message)
      },
    })
  }
  else {
    uploadImage(file)
  }
}
</script>

<template>
  <Dialog :is-open="showImagePicker">
    <div class="flex flex-col ">
      <div class="flex flex-wrap justify-between p-2 mb-4 gap-y-10 overflow-y-scroll max-h-[500px]">
        <div v-for="img in imgs" :key="img" class="w-44">
          <div class="flex items-center cursor-pointer h-44 ring-2 ring-offset-2 ring-slate-200 hover:ring-slate-600" @click="handleSelectImg(`/imgs/${img}`)">
            <img :src="`/imgs/${img}`" alt="" class="w-full">
          </div>
          <div class="relative mt-4 select-all" @click="copyImgPath(`/imgs/${img}`)">
            <div
              type="text"
              class="w-full p-2 pr-10 truncate border border-gray-200 rounded-md shadow-sm cursor-pointer sm:text-sm"
            >
              {{ `/imgs/${img}` }}
            </div>

            <span
              class="absolute inset-y-0 right-0 grid w-10 text-gray-500 pointer-events-none place-content-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M216 40v128h-48V88H88V40Z" opacity=".2" /><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z" /></svg>
            </span>
          </div>
        </div>
      </div>
      <div class="flex justify-end pt-2">
        <button type="button" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 relative">
          <input class="absolute top-0 bottom-0 left-0 right-0 opacity-0 cursor-pointer" type="file" @change="handleUploadImage">
          Upload Image
        </button>

        <button type="button" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" @click="showImagePicker = false">
          Close
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

</style>
