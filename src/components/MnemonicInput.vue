<template>
  <div class="input w-full max-w-md flex items-center">
    <div
      class="input__wrapper relative flex-1 w-full text-inactive hover:text-muted focus-within:text-muted transition-colors"
    >
      <div v-if="hasStartSlot" class="input__icon absolute z-20 top-0 left-0 p-4 pointer-events-none">
        <slot name="start" />
      </div>
      <div
        v-bind="$attrs"
        ref="textarea"
        style="min-height: 98px; display: inline-block; color: #ffffff70"
        contentEditable="true"
        class="relative z-10 w-full py-2 text-0 font-normal text-text placeholder-inactive hover:placeholder-muted focus:placeholder-inactive bg-fg focus:bg-surface rounded-xl focus:rounded-lg border-none appearance-none"
        :class="[hasStartSlot ? 'pl-10' : 'pl-4', hasEndSlot ? 'pr-10' : 'pr-4']"
        @input="update"
      >
        {{ model }}
      </div>
      <div v-if="hasEndSlot" class="input__icon absolute z-20 top-0 right-0 p-4 pointer-events-none">
        <slot name="end" />
      </div>

      <div class="focus-border absolute z-0 -inset-0.5 rounded-xl invisible bg-gold-circular" />
    </div>

    <tippy v-if="hint" class="p-3 text-inactive hover:text-muted transition-colors" tabindex="0">
      <span class="input__hint h-6 w-6"><HintIcon /></span>

      <template #content>
        {{ hint }}
      </template>
    </tippy>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import HintIcon from '@/components/common/Icons/HintIcon.vue';

export default defineComponent({
  name: 'Input',

  components: {
    HintIcon,
  },

  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: undefined,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit, slots }) {
    const model = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    const hasStartSlot = computed(() => !!slots.start);
    const hasEndSlot = computed(() => !!slots.end);

    return { model, hasStartSlot, hasEndSlot };
  },

  methods: {
    update(evt) {
      this.model = evt.currentTarget.innerText;
    },
  },
});
</script>

<style lang="scss" scoped>
[contentEditable] {
  outline: none;
}

[contentEditable]::placeholder {
  transition: color 150ms ease-out;
}

[contentEditable]:focus ~ .focus-border {
  visibility: visible;
}

[contentEditable]:focus-visible {
  outline-color: white;
}

.input__hint {
  font-size: 1.5rem;
}

[placeholder]:empty::before {
  content: attr(placeholder);
  color: #555;
}
</style>
