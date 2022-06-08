<template>
  <div class="page">
    <Header />
    <h1>Managed connected sites</h1>
    <div v-for="site in whitelistedWebsites" :key="site.origin" class="website">
      <Brandmark class="my-auto mr-4" />
      <div class="flex flex-col">
        <span>{{ site.origin }}</span>
        <span class="opacity-60">{{ site.origin }}</span>
        <a
          style="color: #ff6072"
          @click="$router.push({ path: '/settings/whitelisted/remove/', query: { url: site.origin } })"
          >disconnect</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Brandmark from '@/components/common/Brandmark.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

export default defineComponent({
  name: 'Whitelisted Pages',
  components: {
    Brandmark,
    Header,
  },
  computed: {
    whitelistedWebsites() {
      return this.$store.state.extension.whitelistedWebsites;
    },
  },
  mounted() {
    this.$store.dispatch(GlobalEmerisActionTypes.GET_WHITELISTED_WEBSITES);
  },
});
</script>

<style lang="scss" scoped>
.website {
  padding: 24px;

  background: linear-gradient(0deg, #171717 0%, #040404 100%);
  mix-blend-mode: normal;

  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);
  border-radius: 10px;

  margin-bottom: 24px;

  display: flex;
}
</style>
