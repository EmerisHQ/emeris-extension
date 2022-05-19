<template>
  <div class="page">
    <Header title="Choose a password" back-to="/welcome" />
    <PasswordCreateForm :on-continue="() => $router.push(String($route.query.returnTo) || '/create')" />
  </div>
</template>

<script lang="ts" setup>
import Header from '@@/components/Header.vue';
import PasswordCreateForm from '@@/views/PasswordCreateForm.vue';
</script>
