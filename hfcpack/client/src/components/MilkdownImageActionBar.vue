<script setup lang="ts">
const { align, width, height, onChangWidth, onChangHeight, onChangAlign } = defineProps<{
  width: number
  height: number
  align: 'left' | 'center' | 'right'
  onChangWidth: (value: number) => void
  onChangHeight: (value: number) => void
  onChangAlign: (align: 'left' | 'center' | 'right' | undefined) => void
}>()
function showWidthChangePrompt() {
  const width = parseInt(prompt('Width (px)') || '')
  onChangWidth(width)
}

function showHeightChangePrompt() {
  const height = parseInt(prompt('Height (px)') || '')
  onChangHeight(height)
}
function setAlign(a: 'left' | 'center' | 'right') {
  const val = a === align ? undefined : a
  onChangAlign(val)
}
</script>

<template>
  <div
    class="inline-flex overflow-hidden transition-opacity bg-white border divide-x rounded-md shadow-sm h-9 action-bar"
  >
    <div class="flex items-center gap-2 px-2 h-9">
      <input
        placeholder="width"
        :value="width"
        type="text"
        class="w-12 p-1 text-xs text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 "
        @click="showWidthChangePrompt"
      ><span>x</span>
      <input placeholder="height" :value="height" type="text" class="w-12 p-1 text-xs text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 " @click="showHeightChangePrompt">
    </div>
    <button
      :class="`flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50 ${align === 'left' ? ' bg-gray-100' : ''}`"
      title="Align Left"
      @click="setAlign('left')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2Zm0-4v-2h12v2Zm0-4v-2h18v2Zm0-4V7h12v2Zm0-4V3h18v2Z" /></svg>
    </button>
    <button
      :class="`flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50 ${align === 'center' ? ' bg-gray-100' : ''}`"
      title="Align Center"
      @click="setAlign('center')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2Zm4-4v-2h10v2Zm-4-4v-2h18v2Zm4-4V7h10v2ZM3 5V3h18v2Z" /></svg>
    </button>
    <button
      :class="`flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50 ${align === 'right' ? ' bg-gray-100' : ''}`"
      title="Align Right"
      @click="setAlign('right')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2Zm6-4v-2h12v2Zm-6-4v-2h18v2Zm6-4V7h12v2ZM3 5V3h18v2Z" /></svg>
    </button>
  </div>
</template>

<style scoped>

</style>
