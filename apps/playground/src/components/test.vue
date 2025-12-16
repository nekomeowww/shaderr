<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

watch(canvasRef, () => {
  if (!canvasRef.value) {
    return
  }

  const adapter = navigator.gpu.requestAdapter()
}, { immediate: true })
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="512" height="512" />
  </div>
</template>
