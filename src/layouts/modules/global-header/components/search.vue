<template>
  <div>
    <div class="header-action-item search-button" @click="handleOpen">
      <el-tooltip content="全局搜索 (Ctrl+K)" placement="bottom">
        <el-icon>
          <SearchIcon />
        </el-icon>
      </el-tooltip>
    </div>

    <el-dialog
      v-model="visible"
      title="全局搜索"
      width="600px"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
    >
      <el-input
        v-model="keyword"
        placeholder="搜索菜单..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><component :is="SearchIcon" /></el-icon>
        </template>
      </el-input>

      <div class="search-result">
        <el-scrollbar max-height="400px">
          <div v-if="searchResult.length === 0" class="search-empty">
            <el-empty description="暂无搜索结果" :image-size="80" />
          </div>
          <div
            v-for="item in searchResult"
            :key="item.path"
            class="search-item"
            @click="handleSelect(item)"
          >
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <div class="search-item-content">
              <div class="search-item-title">{{ item.title }}</div>
              <div class="search-item-path">{{ item.path }}</div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <template #footer>
        <div class="search-footer">
          <span class="search-tip">
            <el-icon><InfoFilled /></el-icon>
            提示：支持搜索菜单标题和路径
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '@/stores/modules/route'
import { InfoFilled, Search as SearchIcon } from '@element-plus/icons-vue'

interface SearchItem {
  title: string
  path: string
  icon?: string
}

const router = useRouter()
const routeStore = useRouteStore()

const visible = ref(false)
const keyword = ref('')
const searchResult = ref<SearchItem[]>([])

// 使用 watch 而不是 computed，避免响应式依赖问题
watch(keyword, (newKeyword) => {
  if (!newKeyword) {
    searchResult.value = []
    return
  }

  // 确保 menuList 存在且是数组
  if (!routeStore.menuList || !Array.isArray(routeStore.menuList)) {
    searchResult.value = []
    return
  }

  const result: SearchItem[] = []
  const lowerKeyword = newKeyword.toLowerCase()
  const visited = new Set<string>() // 防止循环引用

  // 递归搜索菜单
  function searchMenu(menus: any[], depth = 0) {
    // 限制递归深度，防止无限递归
    if (depth > 10) {
      return
    }

    menus.forEach((menu) => {
      // 使用路径作为唯一标识，防止重复处理
      const menuKey = menu.path || menu.name || ''
      if (!menuKey || visited.has(menuKey)) {
        return
      }
      visited.add(menuKey)

      const title = menu.meta?.title || ''
      const path = menu.path || ''

      if (
        title.toLowerCase().includes(lowerKeyword) ||
        path.toLowerCase().includes(lowerKeyword)
      ) {
        result.push({
          title,
          path,
          icon: menu.meta?.icon,
        })
      }

      if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
        searchMenu(menu.children, depth + 1)
      }
    })
  }

  try {
    searchMenu(routeStore.menuList)
    searchResult.value = result
  } catch (error) {
    console.error('Search menu error:', error)
    searchResult.value = []
  }
})

function handleOpen() {
  visible.value = true
  keyword.value = ''
}

function handleSearch() {
  // 搜索逻辑已在 computed 中实现
}

function handleSelect(item: SearchItem) {
  visible.value = false
  router.push(item.path)
}

// 键盘快捷键支持
function handleKeydown(e: KeyboardEvent) {
  // Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    handleOpen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.search-button {
  cursor: pointer;
  
  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover {
    .el-icon {
      color: var(--color-primary);
    }
  }
}

.search-result {
  margin-top: var(--spacing-md);
}

.search-empty {
  padding: var(--spacing-2xl) 0;
}

.search-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }

  .el-icon {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
}

.search-item-content {
  flex: 1;
}

.search-item-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.search-item-path {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.search-footer {
  display: flex;
  justify-content: center;
}

.search-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
