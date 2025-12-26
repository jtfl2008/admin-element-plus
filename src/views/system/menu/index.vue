<template>
  <div class="system-page">
    <el-card shadow="hover">
      <template #header>
        <div class="page-header">
          <h3>菜单管理</h3>
        </div>
      </template>
      <el-empty description="功能开发中，敬请期待" :image-size="200" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 菜单管理页面
</script>

<style scoped lang="scss">
.system-page {
  padding: var(--spacing-md, 16px);
}

.page-header {
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
