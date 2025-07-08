<template>
  <div class="gi_table_page">
    <GiTable
      title="评论管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
	    <a-input-search v-model="queryForm.reviewType" placeholder="请输入评论的类型 0是主评论1是子评论" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['blog:review:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['blog:review:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['blog:review:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['blog:review:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['blog:review:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <ReviewAddModal ref="ReviewAddModalRef" @save-success="search" />
    <ReviewDetailDrawer ref="ReviewDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import ReviewAddModal from './ReviewAddModal.vue'
import ReviewDetailDrawer from './ReviewDetailDrawer.vue'
import { type ReviewResp, type ReviewQuery, deleteReview, exportReview, listReview } from '@/apis/blog/review'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Review' })


const queryForm = reactive<ReviewQuery>({
  reviewType: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listReview({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '评论内容', dataIndex: 'content', slotName: 'content' },
  { title: '点赞数', dataIndex: 'likes', slotName: 'likes' },
  { title: '博客id', dataIndex: 'blogId', slotName: 'blogId' },
  { title: '回复的是哪个评论的id', dataIndex: 'replyId', slotName: 'replyId' },
  { title: '评论用户id', dataIndex: 'userId', slotName: 'userId' },
  { title: '评论的类型 0是主评论1是子评论', dataIndex: 'reviewType', slotName: 'reviewType' },
  { title: '回复的用户id', dataIndex: 'replyUserId', slotName: 'replyUserId' },
  { title: '评论时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['blog:review:get', 'blog:review:update', 'blog:review:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.reviewType = undefined
  search()
}

// 删除
const onDelete = (record: ReviewResp) => {
  return handleDelete(() => deleteReview(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportReview(queryForm))
}

const ReviewAddModalRef = ref<InstanceType<typeof ReviewAddModal>>()
// 新增
const onAdd = () => {
  ReviewAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ReviewResp) => {
  ReviewAddModalRef.value?.onUpdate(record.id)
}

const ReviewDetailDrawerRef = ref<InstanceType<typeof ReviewDetailDrawer>>()
// 详情
const onDetail = (record: ReviewResp) => {
  ReviewDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
