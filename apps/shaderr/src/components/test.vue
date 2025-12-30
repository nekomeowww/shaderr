<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { isWebGPUSupported } from 'gpuu/webgpu'
import { useTemplateRef } from 'vue'

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

function useGPUAdapter() {
  const adapter = useAsyncState(() => navigator.gpu.requestAdapter(), null)
  const supported = useAsyncState(() => isWebGPUSupported(), false)

  return {
    adapter,
    supported,
  }
}

const { adapter, supported } = useGPUAdapter()
</script>

<template>
  <div>
    Is Ready: {{ adapter.isReady.value }}
    <br>
    Is Supported: {{ supported.state.value }}
    <canvas ref="canvasRef" width="512" height="512" />
  </div>
</template>
