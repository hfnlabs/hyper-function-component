<script setup lang="ts">
const { onClickOpen } = defineProps<{
  onClickOpen: () => void
  onClickEdit: () => void
  onClickReload: () => void
  onClickDelete: () => void
}>()
</script>

<template>
  <div
    class="inline-flex overflow-hidden transition-opacity bg-white border divide-x rounded-md shadow-sm h-9 action-bar"
  >
    <button
      class="flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50"
      title="Open In New Tab"
      @click="onClickOpen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h6q.425 0 .713.287Q12 3.575 12 4t-.287.712Q11.425 5 11 5H5v14h14v-6q0-.425.288-.713Q19.575 12 20 12t.712.287Q21 12.575 21 13v6q0 .825-.587 1.413Q19.825 21 19 21Zm4-6q-.275-.275-.275-.7q0-.425.275-.7L17.6 5H15q-.425 0-.712-.288Q14 4.425 14 4t.288-.713Q14.575 3 15 3h5q.425 0 .712.287Q21 3.575 21 4v5q0 .425-.288.712Q20.425 10 20 10t-.712-.288Q19 9.425 19 9V6.4l-8.625 8.625q-.275.275-.675.275T9 15Z" /></svg>
    </button>
    <button
      class="flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50"
      title="Show Editor"
      @click="onClickEdit"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h1.4l8.625-8.625l-1.4-1.4L5 17.6ZM19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575q.837 0 1.412.575l1.4 1.4q.575.575.6 1.388q.025.812-.55 1.387ZM4 21q-.425 0-.712-.288Q3 20.425 3 20v-2.825q0-.2.075-.387q.075-.188.225-.338l10.3-10.3l4.25 4.25l-10.3 10.3q-.15.15-.337.225q-.188.075-.388.075ZM14.325 9.675l-.7-.7l1.4 1.4Z" /></svg>
    </button>
    <button
      class="flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50"
      title="Reload"
      @click="onClickReload"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.706 6.706 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95C10.46 2.64 18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0Z" /></svg>
    </button>
    <button
      class="flex items-center justify-center p-2 text-gray-700 h-9 w-9 hover:bg-gray-50"
      title="Delete"
      @click="onClickDelete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" /></svg>
    </button>
  </div>
</template>
