<template>
  <ConfirmationScreen title="Create or import another wallet in your extension">
    <div class="buttons mt-auto">
      <AccountCreateSection />
    </div>
  </ConfirmationScreen>
</template>

<script lang="ts" setup>
import AccountCreateSection from '@@/views/AccountCreateSection.vue';
import ConfirmationScreen from '@@/views/ConfirmationScreen.vue';
</script>
