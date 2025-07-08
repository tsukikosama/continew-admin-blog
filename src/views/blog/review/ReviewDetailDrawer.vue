<template>
  <a-drawer v-model:visible="visible" title="评论详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="评论内容">{{ dataDetail?.content }}</a-descriptions-item>
      <a-descriptions-item label="点赞数">{{ dataDetail?.likes }}</a-descriptions-item>
      <a-descriptions-item label="博客id">{{ dataDetail?.blogId }}</a-descriptions-item>
      <a-descriptions-item label="回复的是哪个评论的id">{{ dataDetail?.replyId }}</a-descriptions-item>
      <a-descriptions-item label="评论用户id">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="评论的类型 0是主评论1是子评论">{{ dataDetail?.reviewType }}</a-descriptions-item>
      <a-descriptions-item label="回复的用户id">{{ dataDetail?.replyUserId }}</a-descriptions-item>
      <a-descriptions-item label="评论时间">{{ dataDetail?.createTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ReviewDetailResp, getReview as getDetail } from '@/apis/blog/review'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ReviewDetailResp>()
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
