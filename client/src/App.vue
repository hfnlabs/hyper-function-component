<script setup lang="ts">
import './styles/main.css'
import Document from './views/Document.vue'
import { useImagePicker } from './composables/useImagePicker'
import ImagePicker from '@/components/ImagePicker.vue'
</script>

<template>
  <Document />
  <ImagePicker />
</template>
