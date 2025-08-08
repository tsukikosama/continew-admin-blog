<template>
  <div class="gi_table_page">
    <GiTable
      title="标签管理"
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
	    <a-input-search v-model="queryForm.name" placeholder="请输入标签名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['blog:tag:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['blog:tag:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['blog:tag:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['blog:tag:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['blog:tag:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
      <template #imgUrl = "{ record }">
        <a-image
            width="50"
            :src="record.imgUrl"
        />
      </template>
    </GiTable>

    <TagAddModal ref="TagAddModalRef" @save-success="search" />
    <TagDetailDrawer ref="TagDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import TagAddModal from './TagAddModal.vue'
import TagDetailDrawer from './TagDetailDrawer.vue'
import { type TagResp, type TagQuery, deleteTag, exportTag, listTag } from '@/apis/blog/tag'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Tag' })


const queryForm = reactive<TagQuery>({
  name: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listTag({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '标签名称', dataIndex: 'name', slotName: 'name' },
  { title: '标签图片', dataIndex: 'imgUrl', slotName: 'imgUrl' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['blog:tag:get', 'blog:tag:update', 'blog:tag:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.name = undefined
  search()
}

// 删除
const onDelete = (record: TagResp) => {
  return handleDelete(() => deleteTag(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportTag(queryForm))
}

const TagAddModalRef = ref<InstanceType<typeof TagAddModal>>()
// 新增
const onAdd = () => {
  TagAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: TagResp) => {
  TagAddModalRef.value?.onUpdate(record.id)
}

const TagDetailDrawerRef = ref<InstanceType<typeof TagDetailDrawer>>()
// 详情
const onDetail = (record: TagResp) => {
  TagDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
