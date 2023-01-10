<script setup lang="ts">
import { ref, watch } from 'vue'

import { useUrlSearchParams } from '@vueuse/core'
import Sidebar from '../components/Sidebar.vue'
import PropTypes from '../components/PropTypes.vue'

import HeaderInfo from '../components/Header.vue'
import CssVars from '../components/CssVars.vue'
import Readme from '../components/Readme.vue'
import { useManifest } from '@/composables/useManifest'

const { manifest } = useManifest()

const params = useUrlSearchParams('history')
const activeTab = ref(params.tab || 'Readme')
watch(activeTab, (value) => {
  params.tab = value
})
</script>

<template>
  <div v-if="manifest" class="my-4 md:my-8 mx-auto max-w-[1164px]">
    <div class="mx-4 md:mx-8 md:pr-[332px] relative">
      <div class="relative z-10">
        <HeaderInfo
          :active-tab="activeTab"
          @change-tab="activeTab = $event.name"
        />
        <div>
          <div v-show="activeTab === 'Readme'">
            <Readme />
          </div>

          <div v-if="activeTab === 'PropTypes'">
            <PropTypes />
          </div>
          <div v-if="activeTab === 'DesignTokens'">
            <CssVars />
          </div>
        </div>
      </div>

      <Sidebar />
    </div>
  </div>
</template>
