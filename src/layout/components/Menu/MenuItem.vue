<template>
  <template v-if="!item.meta?.hidden">
    <a-menu-item
      v-if="
        isOneShowingChild
          && (!onlyOneChild?.children || onlyOneChild?.meta?.noShowingChildren)
          && !item?.meta?.alwaysShow
      "
      v-bind="attrs"
      :key="onlyOneChild?.path"
    >
      <template #icon>
        <MenuIcon
          :svg-icon="onlyOneChild?.meta?.svgIcon || item?.meta?.svgIcon"
          :icon="onlyOneChild?.meta?.icon || item?.meta?.icon"
        />
      </template>
      <span>{{ onlyOneChild?.meta?.title }}</span>
    </a-menu-item>

    <a-sub-menu v-else v-bind="attrs" :key="item.path" :title="item?.meta?.title">
      <template #icon>
        <MenuIcon :icon="item?.meta?.icon" />
      </template>
      <MenuItem v-for="child in item.children" :key="child.path" :item="child"></MenuItem>
    </a-sub-menu>
  </template>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import MenuIcon from './MenuIcon.vue'

defineOptions({ name: 'MenuItem' })
const props = withDefaults(defineProps<Props>(), {})

const attrs = useAttrs()

interface Props {
  item: RouteRecordRaw
}

// 如果hidden: false那么代表这个路由项显示在左侧菜单栏中
// 如果props.item的子项children只有一个hidden: false的子元素, 那么onlyOneChild就表示这个子元素
const onlyOneChild = ref<RouteRecordRaw | null>(null)
const isOneShowingChild = ref(false)

const handleFunction = () => {
  const children = props.item?.children?.length ? props.item.children : []
  // 判断是否只有一个显示的子项
  const showingChildren = children.filter((i) => i.meta?.hidden === false)
  if (showingChildren.length) {
    // 保存子项最后一个hidden: false的元素
    onlyOneChild.value = showingChildren[showingChildren.length - 1]
  }

  // 当只有一个要显示子路由时, 默认显示该子路由器
  if (showingChildren.length === 1) {
    isOneShowingChild.value = true
  }

  // 如果没有要显示的子路由, 则显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...props.item, meta: { ...props.item.meta, noShowingChildren: true } } as any
    isOneShowingChild.value = true
  }
}

handleFunction()
</script>
