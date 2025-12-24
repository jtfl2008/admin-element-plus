<template>
  <div class="layout-blank">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 空白布局，用于登录页等不需要导航的页面
</script>

<style scoped>
.layout-blank {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
</style>
