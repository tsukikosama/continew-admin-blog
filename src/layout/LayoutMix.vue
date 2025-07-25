<template>
  <div class="layout-mix">
    <section
      v-if="isDesktop" class="layout-mix-left" :class="{ 'app-menu-dark': appStore.menuDark }"
      :style="appStore.menuDark ? appStore.themeCSSVar : undefined"
    >
      <Logo :collapsed="appStore.menuCollapse"></Logo>
      <Menu :menus="leftMenus" :menu-style="{ width: '220px', flex: 1 }"></Menu>
      <WwAds class="ads" />
    </section>

    <section class="layout-mix-right">
      <header class="header">
        <MenuFoldBtn></MenuFoldBtn>
        <a-menu
          v-if="isDesktop" mode="horizontal" :selected-keys="activeMenu" :auto-open-selected="false"
          :trigger-props="{ animationName: 'slide-dynamic-origin' }" @menu-item-click="onMenuItemClick"
        >
          <a-menu-item v-for="item in topMenus" :key="item.path">
            <template #icon>
              <GiSvgIcon :name="getMenuIcon(item)" :size="24" />
            </template>
            <span>{{ item.meta?.title || item.children?.[0]?.meta?.title || '' }}</span>
          </a-menu-item>
        </a-menu>
        <HeaderRightBar></HeaderRightBar>
      </header>

      <Tabs></Tabs>
      <Main></Main>
      <GiFooter v-if="appStore.copyrightDisplay" />
    </section>

    <!-- 公告弹窗 -->
    <NoticePopup ref="noticePopupRef" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { searchTree } from 'xe-utils'
import Main from './components/Main.vue'
import Tabs from './components/Tabs/index.vue'
import Menu from './components/Menu/index.vue'
import HeaderRightBar from './components/HeaderRightBar/index.vue'
import Logo from './components/Logo.vue'
import MenuFoldBtn from './components/MenuFoldBtn.vue'
import WwAds from './components/WwAds.vue'
import GiFooter from '@/components/GiFooter/index.vue'
import NoticePopup from '@/views/user/message/components/NoticePopup.vue'
import { useAppStore, useRouteStore } from '@/stores'
import { isExternal } from '@/utils/validate'
import { filterTree } from '@/utils'
import { useDevice } from '@/hooks'
import { getToken } from '@/utils/auth'

defineOptions({ name: 'LayoutMix' })
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const routeStore = useRouteStore()
const { isDesktop } = useDevice()
// 过滤是菜单的路由
const cloneRoutes = JSON.parse(JSON.stringify(routeStore.routes)) as RouteRecordRaw[]
const menuRoutes = filterTree(cloneRoutes, (i) => i.meta?.hidden === false)

// 顶部一级菜单
const topMenus = ref<RouteRecordRaw[]>([])
topMenus.value = JSON.parse(JSON.stringify(menuRoutes))

// 公告弹窗引用
const noticePopupRef = ref<InstanceType<typeof NoticePopup>>()

// 检查并显示未读公告
const checkAndShowNotices = () => {
  const token = getToken()

  // 如果有token，检查未读公告
  if (token) {
    setTimeout(() => {
      noticePopupRef.value?.open()
    }, 1000) // 延迟1秒显示，让页面先加载完成
  }
}

const getMenuIcon = (item: RouteRecordRaw) => {
  return item.meta?.icon || item.children?.[0].meta?.icon
}

// 克隆是菜单的路由
const cloneMenuRoutes: RouteRecordRaw[] = JSON.parse(JSON.stringify(menuRoutes))
// 顶部一级菜单选中的
const activeMenu = ref<string[]>([])
// 左侧的菜单
const leftMenus = ref<RouteRecordRaw[]>([])
// 获取左侧菜单
const getLeftMenus = (key: string) => {
  const arr = searchTree(cloneMenuRoutes, (i) => i.path === key, { children: 'children' })
  const rootPath = arr.length ? arr[0].path : ''
  const obj = cloneMenuRoutes.find((i) => i.path === rootPath)
  activeMenu.value = obj ? [obj.path] : ['']
  leftMenus.value = obj ? (obj.children as RouteRecordRaw[]) : []
}

const onMenuItemClick = (key: string) => {
  if (isExternal(key)) {
    window.open(key)
    return
  }
  setTimeout(() => getLeftMenus(key))
  const obj = topMenus.value.find((i) => i.path === key)
  if (obj && obj.redirect === 'noRedirect') return
  router.push({ path: key })
}

watch(
  () => route.path,
  (newPath) => {
    nextTick(() => {
      getLeftMenus(newPath)
    })
  },
  { immediate: true },
)

onMounted(() => {
  checkAndShowNotices()
})
</script>

<style scoped lang="scss">
:deep(.arco-menu-pop) {
  white-space: nowrap;
}

:deep(.arco-menu.arco-menu-vertical.arco-menu-collapsed) {

  // Menu菜单组件修改
  .arco-menu-icon {
    margin-right: 0;
    padding: 10px 0;
  }

  .arco-menu-has-icon {
    padding: 0;
    justify-content: center;
  }

  .arco-menu-title {
    display: none;
  }
}

:deep(.arco-menu-horizontal) {
  flex: 1;
  overflow: hidden;

  .arco-menu-inner {
    padding-left: 0;

    .arco-menu-overflow-wrap {
      white-space: nowrap;
    }
  }
}

.layout-mix {
  height: 100%;
  display: flex;
  align-items: stretch;
  overflow: hidden;

  &-left {
    border-right: 1px solid var(--color-border);
    background-color: var(--color-bg-1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.header {
  padding: 0 $padding;
  height: 56px;
  color: var(--color-text-1);
  background: var(--color-bg-1);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}
</style>
