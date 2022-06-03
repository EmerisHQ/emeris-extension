<template>
  <div class="header-container">
    <slot name="backButton">
      <div v-if="showBack" class="back-button" @click="goBack">
        <Icon name="CaretLeftIcon" :icon-size="1" class="ml-2" />
      </div>
    </slot>
    <span class="title">{{ title }}</span>
    <slot name="closeButton">
      <div v-if="showClose" class="close-button" @click="goBack">
        <Icon name="CloseIcon" :icon-size="1.5" class="mr-2" />
      </div>
    </slot>
    <div class="absolute right-4 additional-button">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

import Icon from '@/components/ui/Icon.vue';

const router = useRouter();

interface Props {
  title: string;
  showBack?: boolean;
  showClose?: boolean;
  backTo?: string;
}
const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showClose: false,
  backTo: undefined,
});

const goBack = () => {
  props.backTo ? router.push(props.backTo) : router.go(-1);
};
</script>

<style>
.header-container {
  @apply w-full pb-6 flex content-between;
}
.title {
  @apply font-semibold mx-auto;
}
.back-button {
  @apply -ml-3 -mr-5 mt-1;
}
.close-button {
  @apply -mr-3 -ml-5 mt-1;
}
</style>
