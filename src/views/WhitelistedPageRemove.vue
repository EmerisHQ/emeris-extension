<template>
  <div class="page">
    <Header title="Authorized websites" :show-back="false" />
    <Loader v-if="!currentWhitelistedWebsite" />
    <div v-else>
      <div class="mx-auto w-fit mb-4 mt-12">
        <img class="h-20 w-20" :src="'/images/Avatar.svg'" />
      </div>
      <div class="text-center">
        <p class="text-2 font-bold mb-2">Are you sure you want to remove {{ currentWhitelistedWebsite.title }}?</p>
        <p class="secondary-text">
          {{ currentWhitelistedWebsite.url }} will no longer be able to view your accounts and approve transactions.
        </p>
      </div>
    </div>
    <div class="mt-auto">
      <Button name="Yes, remove" @click="removeWebsite" />
      <Button name="Cancel" variant="link" @click="$router.go(-1)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import { useStore } from '@/utils/useStore';
// import { useStore } from '@/utils/useStore';
import Header from '@@/components/Header.vue';

const store = useStore();
const route = useRoute();

const whitelistedWebsites = computed(() => {
  return store.state.extension.whitelistedWebsites;
});

const currentWhitelistedWebsite = computed(() => {
  console.log('route', route.params.index);
  return whitelistedWebsites.value.filter((item, index) => index === Number(route.params.index))[0];
});

const removeWebsite = () => {
  console.log('hello');
};
</script>
