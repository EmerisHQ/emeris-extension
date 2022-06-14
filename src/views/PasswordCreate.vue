<template>
  <div class="page">
    <Header title="Choose a password" back-to="/welcome" />
    <PasswordCreateForm :on-continue="() => router.push(String(route.query.returnTo) || '/welcome/create')" />
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';

import Header from '@@/components/Header.vue';
import PasswordCreateForm from '@@/views/PasswordCreateForm.vue';

const router = useRouter();
const route = useRoute();
</script>
