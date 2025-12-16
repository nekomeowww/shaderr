<script setup lang="ts">
import { Preview } from '../components/preview'
import Test from '../components/test.vue'
</script>

<template>
  <div flex flex-col gap-2 relative h-full>
    <div w-full flex flex-row gap-2 h-full>
      <Preview>
        <Test />
      </Preview>
    </div>
  </div>
</template>
