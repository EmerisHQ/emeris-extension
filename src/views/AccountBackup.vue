<template>
  <div class="page">
    <Header title="Back up account" />
    <span class="secondary-text mb-4">If your device is lost or stolen, you will be able to recover your wallet</span>
    <ListCard
      :img="'/images/NeverShare.png'"
      caption="Emeris wallet will never ask you to share your recovery phrase."
    />
    <ListCard :img="'/images/Secure.png'" caption="Never share your recovery phrase with anyone, store it securily." />
    <ListCard
      :img="'/images/Backup.png'"
      caption="If you don’t backup your wallet, or loose your recovery phrase, you will not able to recover your wallet"
    />

    <div class="mt-auto buttons">
      <Button name="Back up now" @click="goToShowMnemonic" />
      <Button name="Back up later" variant="link" @click="backUpLater = true" />
    </div>

    <Slideout :open="backUpLater" @update:open="backUpLater = $event">
      <h1 class="mb-4">Back up later</h1>
      <div class="secondary-text mb-6 text-center">
        You may not be able to recover your account if you have not backed up your recovery phrase.
      </div>

      <Checkbox
        v-model="checked"
        class="mb-6"
        label="I understand if I don’t back up my account, or if I lose my recovery phrase, I will lose access to my account."
      />
      <div class="buttons">
        <Button name="Continue" :disabled="!checked" @click="() => $router.push('/account')" />
        <Button name="Go back" variant="link" @click="() => (backUpLater = false)" />
      </div>
    </Slideout>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import Slideout from '@@/components/Slideout.vue';

const router = useRouter();

const backUpLater = ref(false);
const checked = ref(false);

const goToShowMnemonic = () => {
  router.push({ path: '/backup/password' });
};
</script>

<style lang="scss" scoped>
/* overrides checkbox component label class */
.leading-copy {
  @apply text-sm;
}
/* overrides disabled button component background and text color */
.text-inactive {
  background-color: #333333;
  color: #ffffff;
}
:deep(.checkbox__control) {
  @apply border-text;

  &:checked {
    background: center/contain no-repeat url('@@/assets/Checkbox.svg');
  }
}
</style>
