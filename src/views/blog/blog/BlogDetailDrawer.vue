<template>
  <a-drawer v-model:visible="visible" title="博客详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="id">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="标题">{{ dataDetail?.title }}</a-descriptions-item>
      <a-descriptions-item label="图片">{{ dataDetail?.picture }}</a-descriptions-item>
      <a-descriptions-item label="内容">{{ dataDetail?.content }}</a-descriptions-item>
      <a-descriptions-item label="是否有效">{{ dataDetail?.isValid }}</a-descriptions-item>
      <a-descriptions-item label="版本">{{ dataDetail?.version }}</a-descriptions-item>
      <a-descriptions-item label="流量数量">{{ dataDetail?.visit }}</a-descriptions-item>
      <a-descriptions-item label="简化标题">{{ dataDetail?.simpleTitle }}</a-descriptions-item>
      <a-descriptions-item label="用户id">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="0保存 1发布">{{ dataDetail?.state }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type BlogDetailResp, getBlog as getDetail } from '@/apis/blog/blog'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<BlogDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
