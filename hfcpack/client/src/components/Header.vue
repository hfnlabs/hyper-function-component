<script setup lang="ts">
import { ref } from 'vue'

defineProps(['activeTab', 'name', 'desc'])

const emit = defineEmits(['changeTab'])

const tabs = ref<{ name: string }[]>([
  { name: 'Readme' },
  { name: 'PropTypes' },
  { name: 'DesignTokens' },
])

function changeTab(name: string) {
  emit('changeTab', { name })
}
</script>

<template>
  <h1
    class="flex-1 inline-block text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200 select-all"
  >
    {{ name || "\0" }}
  </h1>

  <p class="text text-gray-500 dark:text-gray-400">
    {{ desc || "\0" }}
  </p>

  <div class="my-4 border-b border-gray-200 dark:border-gray-800" />

  <ul class="flex pb-5 space-x-8 text-sm font-semibold">
    <li v-for="tab in tabs" :key="tab.name">
      <a
        :class="
          activeTab === tab.name
            ? 'cursor-pointer'
            : 'cursor-pointer text-gray-500 hover:text-black'
        "
        @click="changeTab(tab.name)"
      >
        {{ tab.name }}
      </a>
    </li>
  </ul>
</template>
