<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const pageTitleRef = ref<HTMLElement>()
const route = useRoute()

const { apply } = useMotion(pageTitleRef, {
  initial: { opacity: 0, x: 10, transition: { duration: 250 } },
  enter: { opacity: 1, x: 0, transition: { duration: 250 } },
  leave: { opacity: 0, x: -10, transition: { duration: 100 } },
})

onMounted(async () => {
  await apply('initial')
  await apply('enter')
})

onUnmounted(async () => {
  await apply('leave')
})

watch([route], async () => {
  await apply('leave')

  await apply('initial')
  await apply('enter')
})
</script>

<template>
  <div flex flex-col gap-2 relative h-full>
    <div w-full flex flex-row gap-2 h-full>
      <div />
    </div>
    <div ref="pageTitleRef" text="latte-text dark:macchiato-text 30" absolute bottom--18 right--10 opacity-20 filter="blur-[5px]" select-none>
      Editor
    </div>
  </div>
</template>
