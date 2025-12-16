<script setup lang="ts">
import type { App, Component } from 'vue'

import { createApp, ref, useTemplateRef, watch } from 'vue'

const slots = defineSlots<{ default: Component }>()

const appRef = ref<App<Element>>()
const iframeRef = useTemplateRef<HTMLIFrameElement>('iframeRef')

watch(iframeRef, () => {
  if (!iframeRef.value) {
    return
  }

  const container = document.createElement('div')
  iframeRef.value.contentDocument.body.appendChild(container)

  appRef.value = createApp(slots.default)
  appRef.value.mount(container)
}, { immediate: true })
</script>

<template>
  <iframe ref="iframeRef" class="w-full h-full" />
</template>
