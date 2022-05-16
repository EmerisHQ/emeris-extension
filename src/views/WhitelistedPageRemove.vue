<template>
  <Loader v-if="loading" />
  <ConfirmationScreen v-else :title="`Are you sure you want to disconnect from ${site.origin}?`">
    <div
      :style="{
        marginTop: 'auto',
      }"
      class="buttons"
    >
      <Button name="Remove" @click="remove" />
      <Button name="Cancel" variant="link" @click="$router.go(-1)" />
    </div>
  </ConfirmationScreen>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import ConfirmationScreen from '@@/views/ConfirmationScreen.vue';

export default defineComponent({
  name: 'Whitelisted Page Remove',
  components: {
    Button,
    ConfirmationScreen,
  },
  data: () => ({
    loading: false,
  }),
  computed: {
    site() {
      return this.$store.state.extension.whitelistedWebsites.find((site) => site.origin === this.url);
    },
    url() {
      return this.$route.query.url;
    },
  },
  methods: {
    async remove() {
      this.loading = true;
      await this.$store.dispatch(GlobalEmerisActionTypes.REMOVE_WHITELISTED_WEBSITE, {
        website: this.url,
      });
      await this.$store.dispatch(GlobalEmerisActionTypes.GET_WHITELISTED_WEBSITES);
      this.$router.push('/whitelisted');
    },
  },
});
</script>
<style lang="scss" scoped></style>
