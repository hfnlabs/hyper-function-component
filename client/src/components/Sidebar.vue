<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useManifest } from '@/composables/useManifest'
import { useImagePicker } from '@/composables/useImagePicker'

const { manifest, updateManifest } = useManifest()
const deps = computed(() => {
  if (!manifest)
    return []

  const deps = Object.keys(manifest.value!.deps || {})
  return deps.map((name: any) => ({
    name,
    version: manifest.value!.deps[name].rv,
  }))
})

const sizeJs = ref('--')
const sizeCss = ref('--')
const loadingSize = ref(false)

onMounted(() => {
  setTimeout(() => {
    getSize()
  }, 1000)
})

function getSize() {
  if (loadingSize.value)
    return
  loadingSize.value = true
  sizeJs.value = '--'
  sizeCss.value = '--'
  fetch('/api/size')
    .then(res => res.json())
    .then((res) => {
      loadingSize.value = false
      sizeJs.value = res.sizeJs
      sizeCss.value = res.sizeCss
    })
}

function goNpm(dep: string) {
  window.open(`https://www.npmjs.com/package/${dep}`)
}

const { showImagePicker, onSelectImg } = useImagePicker()
function showBannerImagePicker() {
  showImagePicker.value = true
  onSelectImg((img) => {
    updateManifest('banner', img)
  })
}
</script>

<template>
  <div v-if="manifest" class="sidebar md:absolute md:top-0 md:right-0 md:w-[300px] overflow-hidden">
    <div
      class="flex mb-4 rounded-md cursor-pointer aspect-video no-img-bg"
      @click="showBannerImagePicker"
    >
      <img v-if="manifest.banner" :src="manifest.banner" class="w-full rounded-md object-cover">
    </div>
    <div class="mb-4">
      <div class="py-1 font-semibold text-gray-500">
        Install
      </div>
      <div
        class="px-3 py-2 mb-2 font-mono text-gray-600 truncate border border-gray-200 rounded-md cursor-pointer select-all hover:bg-gray-50"
      >
        hfc i {{ manifest.name }}@{{ manifest.version }}
      </div>
      <div
        class="px-3 py-2 font-mono text-gray-600 truncate border border-gray-200 rounded-md cursor-pointer select-all hover:bg-gray-50"
      >
        import:{{ manifest.name }}="{{ manifest.version }}"
      </div>
    </div>

    <div class="flex pb-3 border-b border-b-gray-200">
      <div class="flex flex-col overflow-hidden sidebar-item basis-1/2">
        <div class="font-semibold leading-6 text-gray-500">
          Version
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" viewBox="0 0 470 470">
            <path
              d="M416,160a64,64,0,1,0-96.27,55.24c-2.29,29.08-20.08,37-75,48.42-17.76,3.68-35.93,7.45-52.71,13.93V151.39a64,64,0,1,0-64,0V360.61a64,64,0,1,0,64.42.24c2.39-18,16-24.33,65.26-34.52,27.43-5.67,55.78-11.54,79.78-26.95,29-18.58,44.53-46.78,46.36-83.89A64,64,0,0,0,416,160ZM160,64a32,32,0,1,1-32,32A32,32,0,0,1,160,64Zm0,384a32,32,0,1,1,32-32A32,32,0,0,1,160,448ZM352,192a32,32,0,1,1,32-32A32,32,0,0,1,352,192Z"
            />
          </svg>
          <div class="flex-1 truncate">
            {{ manifest.version }}
          </div>
        </div>
      </div>
      <div class="flex flex-col overflow-hidden sidebar-item basis-1/2">
        <span class="font-semibold leading-6 text-gray-500">License</span>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 100 100">
            <path
              id="path2144"
              fill="currentColor"
              d="m 40,62.5 h -0.0031 c 0,-2.528125 0.209375,-1.364063 -13.289062,-28.360937 -2.757813,-5.514063 -10.654688,-5.525 -13.417188,0 C -0.321875,61.367187 0.003125,60.051562 0.003125,62.5 H 0 C 0,69.403125 8.9546875,75 20,75 31.045313,75 40,69.403125 40,62.5 Z M 20,37.5 31.25,60 H 8.75 Z m 79.996875,25 c 0,-2.528125 0.209375,-1.364063 -13.289062,-28.360937 -2.757813,-5.514063 -10.654688,-5.525 -13.417188,0 C 59.678125,61.367187 60.003125,60.051562 60.003125,62.5 H 60 c 0,6.903125 8.954688,12.5 20,12.5 11.045313,0 20,-5.596875 20,-12.5 z M 68.75,60 80,37.5 91.25,60 Z M 82.5,80 H 55 V 33.945312 C 58.673437,32.3375 61.43125,29.026562 62.248437,25 H 82.5 c 1.38125,0 2.5,-1.11875 2.5,-2.5 v -5 C 85,16.11875 83.88125,15 82.5,15 H 59.94375 C 57.6625,11.98125 54.076562,10 50,10 c -4.076562,0 -7.6625,1.98125 -9.94375,5 H 17.5 C 16.11875,15 15,16.11875 15,17.5 v 5 c 0,1.38125 1.11875,2.5 2.5,2.5 H 37.751563 C 38.56875,29.025 41.325,32.3375 45,33.945312 V 80 H 17.5 C 16.11875,80 15,81.11875 15,82.5 v 5 c 0,1.38125 1.11875,2.5 2.5,2.5 h 65 c 1.38125,0 2.5,-1.11875 2.5,-2.5 v -5 C 85,81.11875 83.88125,80 82.5,80 Z"
              style="stroke-width: 0.15625"
            />
          </svg>
          <div class="flex-1 truncate">
            {{ manifest.license }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex py-3 border-b border-b-gray-200">
      <div class="flex flex-col overflow-hidden sidebar-item basis-1/2">
        <div class="font-semibold leading-6 text-gray-500">
          SizeJs
        </div>
        <div class="flex items-center" @mouseenter="getSize">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 100 100">
            <path
              id="path2144"
              fill="currentColor"
              d="m 50.001953,0 c -10.355502,0 -18.75,8.3944982 -18.75,18.75 0,2.203132 0.449217,4.287103 1.148438,6.25 H 20.632812 c -2.818369,0 -5.28906,2.058584 -6.029296,5.023438 L 0.3359375,87.082031 C -1.2910208,93.587911 3.1991989,100 9.3808594,100 H 90.621094 c 6.179707,0 10.669916,-6.412089 9.042968,-12.917969 L 85.400391,30.023438 C 84.658201,27.056632 82.189462,25 79.371094,25 H 67.603516 c 0.697268,-1.962897 1.148437,-4.046868 1.148437,-6.25 0,-10.3555018 -8.394498,-18.75 -18.75,-18.75 z M 50,12.498047 c 3.445323,0 6.25,2.804677 6.25,6.25 0,3.445324 -2.804677,6.25 -6.25,6.25 -3.445324,0 -6.25,-2.804676 -6.25,-6.25 0,-3.445323 2.804676,-6.25 6.25,-6.25 z M 23.908,34.792969 H 76.318359 L 90.011,89.602 H 10.279 Z"
              style="stroke-width: 0.15625"
            />
          </svg>
          <div class="flex-1 truncate">
            {{ sizeJs }}
          </div>
        </div>
      </div>
      <div class="flex flex-col overflow-hidden sidebar-item basis-1/2">
        <div class="font-semibold leading-6 text-gray-500">
          SizeCss
        </div>
        <div class="flex items-center" @mouseenter="getSize">
          <svg
            class="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 100 100"
            width="14"
            height="14"
          >
            <path
              id="path2144"
              fill="currentColor"
              d="m 50.001953,0 c -10.355502,0 -18.75,8.3944982 -18.75,18.75 0,2.203132 0.449217,4.287103 1.148438,6.25 H 20.632812 c -2.818369,0 -5.28906,2.058584 -6.029296,5.023438 L 0.3359375,87.082031 C -1.2910208,93.587911 3.1991989,100 9.3808594,100 H 90.621094 c 6.179707,0 10.669916,-6.412089 9.042968,-12.917969 L 85.400391,30.023438 C 84.658201,27.056632 82.189462,25 79.371094,25 H 67.603516 c 0.697268,-1.962897 1.148437,-4.046868 1.148437,-6.25 0,-10.3555018 -8.394498,-18.75 -18.75,-18.75 z M 50,12.498047 c 3.445323,0 6.25,2.804677 6.25,6.25 0,3.445324 -2.804677,6.25 -6.25,6.25 -3.445324,0 -6.25,-2.804676 -6.25,-6.25 0,-3.445323 2.804676,-6.25 6.25,-6.25 z M 23.908,34.792969 H 76.318359 L 90.011,89.602 H 10.279 Z"
              style="stroke-width: 0.15625"
            />
          </svg>
          <div class="flex-1 truncate">
            {{ sizeCss }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="manifest.repository" class="flex flex-col flex-1 py-3 border-b sidebar-item border-b-gray-200">
      <div class="font-semibold leading-6 text-gray-500">
        Repository
      </div>
      <div class="flex items-center ">
        <svg
          class="w-4 h-4 mr-2" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3169"
          xmlns:xlink="http://www.w3.org/1999/xlink" width="200.1953125" height="200"
        >
          <path
            d="M1004.692673 466.396616l-447.094409-447.073929c-25.743103-25.763582-67.501405-25.763582-93.264987 0l-103.873521 103.873521 78.171378 78.171378c12.533635-6.00058 26.562294-9.359266 41.389666-9.359266 53.02219 0 96.00928 42.98709 96.00928 96.00928 0 14.827372-3.358686 28.856031-9.359266 41.389666l127.97824 127.97824c12.533635-6.00058 26.562294-9.359266 41.389666-9.359266 53.02219 0 96.00928 42.98709 96.00928 96.00928s-42.98709 96.00928-96.00928 96.00928-96.00928-42.98709-96.00928-96.00928c0-14.827372 3.358686-28.856031 9.359266-41.389666l-127.97824-127.97824c-3.051489 1.454065-6.184898 2.744293-9.379746 3.870681l0 266.97461c37.273227 13.188988 63.99936 48.721433 63.99936 90.520695 0 53.02219-42.98709 96.00928-96.00928 96.00928s-96.00928-42.98709-96.00928-96.00928c0-41.799262 26.726133-77.331707 63.99936-90.520695l0-266.97461c-37.273227-13.188988-63.99936-48.721433-63.99936-90.520695 0-14.827372 3.358686-28.856031 9.359266-41.389666l-78.171378-78.171378-295.892081 295.871601c-25.743103 25.784062-25.743103 67.542365 0 93.285467l447.114889 447.073929c25.743103 25.743103 67.480925 25.743103 93.264987 0l445.00547-445.00547c25.763582-25.763582 25.763582-67.542365 0-93.285467z"
            p-id="3170"
          />
        </svg>
        <a class="flex-1 truncate hover:underline" :href="manifest.repository" target="_blank">
          {{ manifest.repository }}
        </a>
      </div>
    </div>

    <div v-if="manifest.homepage" class="flex flex-col flex-1 py-3 border-b sidebar-item border-b-gray-200">
      <div class="font-semibold leading-6 text-gray-500">
        Homepage
      </div>
      <div class="flex items-center ">
        <svg
          class="w-4 h-4 mr-2" width="100px" height="100px"
          viewBox="0 0 24 24" fill="currentColor" version="1.1"
        >
          <path
            d="m 10.169326,13.830674 c 0.532324,0.506356 0.532324,1.3373 0,1.843657 -0.5063561,0.506356 -1.3373001,0.506356 -1.8436571,0 -2.5317821,-2.531783 -2.5317821,-6.6475531 0,-9.1793352 v 0 l 4.5961601,-4.596159 c 2.531782,-2.53178254 6.647552,-2.53178254 9.179334,0 2.531783,2.5317825 2.531783,6.6475521 0,9.1793342 l -1.934541,1.934542 c 0.01298,-1.064647 -0.155802,-2.129294 -0.51934,-3.1420071 l 0.610224,-0.623208 c 1.532053,-1.51907 1.532053,-3.9859346 0,-5.5050041 -1.519069,-1.532053 -3.985934,-1.532053 -5.505004,0 l -4.583176,4.5831751 c -1.5320531,1.51907 -1.5320531,3.9859351 0,5.5050051 m 3.661348,-5.5050051 c 0.506356,-0.506356 1.3373,-0.506356 1.843657,0 2.531782,2.5317831 2.531782,6.6475531 0,9.1793351 v 0 l -4.59616,4.596159 c -2.5317821,2.531783 -6.6475517,2.531783 -9.1793342,0 -2.53178254,-2.531782 -2.53178254,-6.647552 0,-9.179334 l 1.9345415,-1.934542 c -0.012983,1.064647 0.155802,2.129294 0.51934,3.154991 l -0.6102245,0.610224 c -1.532053,1.51907 -1.532053,3.985935 0,5.505004 1.5190695,1.532053 3.9859341,1.532053 5.5050041,0 l 4.5831761,-4.583175 c 1.532053,-1.51907 1.532053,-3.985935 0,-5.505005 -0.532324,-0.5063561 -0.532324,-1.3373001 0,-1.8436571 z"
          />
        </svg>
        <a class="flex-1 truncate hover:underline" :href="manifest.homepage" target="_blank">
          {{ manifest.homepage }}
        </a>
      </div>
    </div>

    <div>
      <h3 class="my-2 font-semibold leading-6 text-gray-500">
        Dependencies
      </h3>
      <div v-if="deps.length === 0" class="text-sm text-slate-400">
        No Dependency
      </div>
      <div
        v-for="dep in deps"
        :key="dep.name"
        class="flex justify-between cursor-pointer mx-[-6px] px-[6px] mb-1 hover:bg-slate-300/30 rounded"
        @click="goNpm(dep.name)"
      >
        <span class="text-gray-900 truncate">{{ dep.name }}</span>
        <span class="text-slate-400">{{ dep.version }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.sidebar {

}
.sidebar-item svg {
  color: rgb(107, 114, 128);
  fill: rgb(107, 114, 128);
}
</style>
