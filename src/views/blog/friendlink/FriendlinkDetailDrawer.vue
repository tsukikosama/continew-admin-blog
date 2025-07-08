<template>
  <a-drawer v-model:visible="visible" title="友链详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="网站链接">{{ dataDetail?.webUrl }}</a-descriptions-item>
      <a-descriptions-item label="网站名字">{{ dataDetail?.webName }}</a-descriptions-item>
      <a-descriptions-item label="网站描述">{{ dataDetail?.webDescript }}</a-descriptions-item>
      <a-descriptions-item label="添加时间">{{ dataDetail?.webTime }}</a-descriptions-item>
      <a-descriptions-item label="网站图片">{{ dataDetail?.webImg }}</a-descriptions-item>
      <a-descriptions-item label="0为为审核通过 1为审核通过">{{ dataDetail?.webAccess }}</a-descriptions-item>
      <a-descriptions-item label="用户邮箱">{{ dataDetail?.webEmail }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type FriendlinkDetailResp, getFriendlink as getDetail } from '@/apis/blog/friendlink'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<FriendlinkDetailResp>()
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
