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
          {{ currentWhitelistedWebsite.origin }} will no longer be able to view your accounts and approve transactions.
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
import { useRoute, useRouter } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import { useStore } from '@/utils/useStore';
// import { useStore } from '@/utils/useStore';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const route = useRoute();
const router = useRouter();

const getWebsiteTitle = (origin: string) => {
  if (origin.includes('https://')) {
    return origin.replace('https://', '');
  } else if (origin.includes('http://')) {
    return origin.replace('http://', '');
  } else {
    return origin;
  }
};

const whitelistedWebsites = computed(() => {
  const websites = store.state.extension.whitelistedWebsites;
  return websites.map((item) => {
    return { ...item, title: getWebsiteTitle(item.origin) };
  });
});

const currentWhitelistedWebsite = computed(() => {
  return whitelistedWebsites.value.filter((item, index) => index === Number(route.params.index))[0];
});

const removeWebsite = async () => {
  await store.dispatch(GlobalEmerisActionTypes.REMOVE_WHITELISTED_WEBSITE, {
    website: currentWhitelistedWebsite.value.origin,
  });
  router.push('/whitelisted');
};
</script>
