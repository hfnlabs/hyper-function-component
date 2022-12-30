<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from './Dialog.vue'
import { useManifest } from '@/composables/useManifest'

defineProps(['activeTab'])

const emit = defineEmits(['changeTab'])

const { manifest, updateManifest } = useManifest()

const tabs = ref<{ name: string }[]>([
  { name: 'Readme' },
  { name: 'PropTypes' },
  { name: 'DesignTokens' },
])

function changeTab(name: string) {
  emit('changeTab', { name })
}

const HFC_INIT_NAME = 'demo-hfc'
const showNameDialog = ref(manifest.value?.name === HFC_INIT_NAME)
const inputName = ref(manifest.value!.name === HFC_INIT_NAME ? '' : manifest.value!.name)
const inputNameValidateError = ref('')
const inputNameValid = computed(() => !!inputName.value && !inputNameValidateError.value)

watch(inputName, (value) => {
  checkHfcName(value)
})

function checkHfcName(input: string) {
  const ref = '\nref: https://bit.ly/3QzRS7S'

  if (input.length > 64)
    return inputNameValidateError.value = 'name is too long (max 64 characters)'

  if (!input.includes('-'))
    return inputNameValidateError.value = 'name must contain a \'-\' \nlike awesome-button'

  if (/[^a-z]/.test(input[0]))
    return inputNameValidateError.value = 'first character must be [a-z]'

  if (/[^a-z0-9]/.test(input[input.length - 1]))
    return inputNameValidateError.value = 'last character must be [a-z] [0-9] '

  if (/[^a-z0-9\-]/.test(input))
    return inputNameValidateError.value = 'invalid name, valid character is [a-z] [0-9] and -'

  if (
    [
      'demo-hfc',
      'annotation-xml',
      'color-profile',
      'font-face',
      'font-face-src',
      'font-face-uri',
      'font-face-format',
      'font-face-name',
      'missing-glyph',
    ].includes(input)
  )
    return inputNameValidateError.value = `${input} is reveresd`

  inputNameValidateError.value = ''
}

async function saveName() {
  if (!inputNameValid.value)
    return

  if (inputName.value === manifest.value?.name) {
    showNameDialog.value = false
    return
  }

  await updateManifest('name', inputName.value)

  showNameDialog.value = false
  location.reload()
}
</script>

<template>
  <h1
    class="flex-1 inline-block text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200"
    @click="showNameDialog = true"
  >
    {{ manifest?.name || "\0" }}
  </h1>

  <p class="text text-gray-500 dark:text-gray-400">
    {{ manifest?.description || "\0" }}
  </p>

  <div class="my-4 border-b border-gray-200 dark:border-gray-800" />

  <ul class="flex pb-5 space-x-8 text-sm font-semibold">
    <li v-for="tab in tabs" :key="tab.name">
      <a
        :class="
          activeTab === tab.name
            ? 'cursor-pointer'
            : 'cursor-pointer text-gray-500 hover:text-black'
        " @click="changeTab(tab.name)"
      >
        {{ tab.name }}
      </a>
    </li>
  </ul>

  <Dialog :is-open="showNameDialog">
    <div class="mb-6">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
      <input
        id="name" v-model="inputName" type="text"
        class="border text-gray-900 text-sm rounded-lg block w-full p-2.5"
        :class="[inputNameValidateError ? 'bg-red-50 border-red-500 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50 border-gray-300 focus:ring-green-500 focus:border-green-500']"
      >
      <p v-if="inputNameValidateError" class="mt-2 text-sm text-red-600 dark:text-red-500">
        {{ inputNameValidateError }}
      </p>
    </div>
    <div class="flex justify-end">
      <button
        :disabled="!inputNameValid" type="button"
        class="border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 "
        :class="[inputNameValid ? 'text-gray-900 bg-white' : 'text-gray-500 bg-gray-100 cursor-not-allowed']"
        @click="saveName"
      >
        OK
      </button>
    </div>
  </Dialog>
</template>
