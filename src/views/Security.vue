<template>
  <div class="page">
    <Header title="Security" />
    <!-- <div class="menu-item" @click="$router.push('/passwordChange/old')">
      Change Password <Icon name="ChevronRightIcon" />
    </div> -->
    <!-- <div class="menu-item">Extension auto-lock <Icon name="ChevronRightIcon" /></div> -->
    <!-- <div class="menu-item">Require for extension access</div> -->
  </div>
</template>

<script lang="ts" setup>
// import Icon from "@/components/ui/Icon.vue";
import Header from '@@/components/Header.vue';
</script>

<style lang="scss" scoped>
.menu-item {
  padding: 14px 0;
  cursor: pointer;

  .icon {
    display: inline-block;
    float: right;
  }
}
</style>
