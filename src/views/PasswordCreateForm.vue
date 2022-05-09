<template>
  <div class="form" @keyup.enter="submit">
    <span class="secondary-text mb-6">You will need this password to unlock your wallet.</span>
    <div
      class="mb-4"
      :class="{
        error: password && isPasswordInvalid,
        success: password && !isPasswordInvalid,
      }"
    >
      <Input
        v-model="password"
        :placeholder="passwordChange ? 'Enter new password' : 'Enter password'"
        :type="passwordVisible ? 'text' : 'password'"
      >
        <template #end>
          <a v-if="password" class="cursor-pointer" @click="() => (passwordVisible = !passwordVisible)">
            <img
              :class="passwordVisible ? 'w-4 h-4' : 'w-4 h-3 mt-0.5'"
              :src="passwordVisible ? '/images/EyeSlash.png' : '/images/Eye.png'"
            />
          </a>
        </template>
      </Input>
    </div>
    <div
      class="mb-6"
      :class="{
        error: passwordRepeated && !match,
        success: passwordRepeated && match,
      }"
    >
      <Input
        v-model="passwordRepeated"
        :placeholder="passwordChange ? 'Confirm new password' : 'Confirm password'"
        :type="passwordVisible ? 'text' : 'password'"
      />
    </div>
    <span class="form-info" :class="{ error: password && !length, success: password && length }"
      ><Icon v-if="password && length" name="CheckIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />
      <Icon v-if="password && !length" name="CloseIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />Minimum 8
      characters</span
    >
    <span class="form-info" :class="{ error: password && !upperCaseChar, success: password && upperCaseChar }"
      ><Icon v-if="password && upperCaseChar" name="CheckIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />
      <Icon v-if="password && !upperCaseChar" name="CloseIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />At
      least one upper case</span
    >
    <span class="form-info" :class="{ error: password && !symbolChar, success: password && symbolChar }"
      ><Icon v-if="password && symbolChar" name="CheckIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />
      <Icon v-if="password && !symbolChar" name="CloseIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />At least
      one symbol</span
    >
    <span class="form-info" :class="{ error: password && !digitChar, success: password && digitChar }"
      ><Icon v-if="password && digitChar" name="CheckIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />
      <Icon v-if="password && !digitChar" name="CloseIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />At least
      one digit</span
    >
    <span
      v-if="passwordRepeated"
      class="form-info"
      :class="{ error: passwordRepeated && !match, success: passwordRepeated && match }"
      ><Icon v-if="passwordRepeated && match" name="CheckIcon" :icon-size="0.8" class="mr-2 inline-flex mt-0.5" />
      <Icon
        v-if="passwordRepeated && !match"
        name="CloseIcon"
        :icon-size="0.8"
        class="mr-2 inline-flex mt-0.5"
      />Passwords {{ passwordRepeated && match ? '' : 'do not ' }}match</span
    >
    <div class="mt-auto">
      <div class="mb-2 -text-1">
        <span class="secondary-text">By continuing you agree to </span
        ><a href="/" class="opacity-100" @click.prevent="open('https://emeris.com/terms')">Terms of Use</a
        ><span class="secondary-text"> & </span
        ><a href="" @click.prevent="open('https://emeris.com/privacy')">Privacy Policy</a
        ><span class="secondary-text"> of Emeris wallet</span>
      </div>
      <Button
        :name="passwordChange ? 'Change password' : 'Continue'"
        type="submit"
        :disabled="isButtonDisabled"
        @click="
          () => {
            submit();
          }
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Input from '@/components/ui/Input.vue';
import { RootState } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

export default defineComponent({
  name: 'Password Create Form',
  components: {
    Button,
    Icon,
    Input,
  },
  props: {
    onContinue: { type: Function, required: true },
    passwordChange: { type: Boolean, required: false, default: false },
  },
  data: () => ({
    password: '',
    passwordRepeated: '',
    passwordVisible: false,

    length: false,
    upperCaseChar: false,
    symbolChar: false,
    digitChar: false,
    match: false,
  }),
  computed: {
    ...mapState({
      wallet: (state: RootState) => state.extension.wallet,
    }),
    isPasswordInvalid() {
      return !this.length || !this.upperCaseChar || !this.symbolChar || !this.digitChar;
    },
    isButtonDisabled() {
      return this.isPasswordInvalid || !this.match;
    },
  },
  watch: {
    password(password) {
      this.length = password.length >= 8;
      this.upperCaseChar = /[A-Z]/g.test(password);
      this.symbolChar = /[$-/:-?{-~!"^_`[\]@]/g.test(password);
      this.digitChar = /[0-9]/g.test(password);
    },
    passwordRepeated(password) {
      this.match = password === this.password;
    },
  },
  methods: {
    async submit() {
      if (this.length && this.upperCaseChar && this.symbolChar && this.digitChar && this.match) {
        if (this.wallet) {
          await this.$store.dispatch(GlobalEmerisActionTypes.CHANGE_PASSWORD, { password: this.password });
        } else {
          await this.$store.dispatch(GlobalEmerisActionTypes.CREATE_WALLET, { password: this.password });
        }
        this.onContinue();
      }
    },
    open(url) {
      window.open(url);
    },
  },
});
</script>
<style lang="scss" scoped>
.terms-of-use {
  font-size: 13px;
}
</style>
