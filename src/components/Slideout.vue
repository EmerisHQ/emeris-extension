<template>
  <div>
    <div v-if="open" class="backdrop" @click.prevent="$emit('update:open', false)"></div>
    <div ref="slideout" class="slideout" :class="{ open: open }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Slideout',
  model: {
    prop: 'open',
    event: 'update',
  },
  props: {
    open: { type: Boolean, required: true },
  },
};
</script>
<style lang="scss" scoped>
.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 67%;
  z-index: 1000;
}
.slideout {
  z-index: 1001;
  visibility: hidden; // to not show before position is calculated
  background: #171717;
  border-radius: 16px 16px 0px 0px;
  position: fixed;
  bottom: -110vh;
  width: 100%;
  left: 0;
  padding: 24px;
  transition: 0.6s;

  &.open {
    bottom: 0 !important;
    visibility: inherit;
  }
}
</style>
