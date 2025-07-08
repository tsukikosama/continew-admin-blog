<template>
  <div class="gi_table_page">
    <GiTable
      title="友链管理"
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
	    <a-input-search v-model="queryForm.webName" placeholder="请输入网站名字" allow-clear @search="search" />
<!--		  <a-radio-group -->
<!--          v-model="queryForm.webAccess" -->
<!--          :options="dictKey 或者自定义数组" -->
<!--          @change="search"-->
<!--        />-->
	    <a-input-search v-model="queryForm.webEmail" placeholder="请输入用户邮箱" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['blog:friendlink:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['blog:friendlink:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['blog:friendlink:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['blog:friendlink:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['blog:friendlink:delete']"
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

    <FriendlinkAddModal ref="FriendlinkAddModalRef" @save-success="search" />
    <FriendlinkDetailDrawer ref="FriendlinkDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import FriendlinkAddModal from './FriendlinkAddModal.vue'
import FriendlinkDetailDrawer from './FriendlinkDetailDrawer.vue'
import { type FriendlinkResp, type FriendlinkQuery, deleteFriendlink, exportFriendlink, listFriendlink } from '@/apis/blog/friendlink'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Friendlink' })


const queryForm = reactive<FriendlinkQuery>({
  webName: undefined,
  webAccess: undefined,
  webEmail: undefined,
  createTime: undefined,
  createUser: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listFriendlink({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '网站链接', dataIndex: 'webUrl', slotName: 'webUrl' },
  { title: '网站名字', dataIndex: 'webName', slotName: 'webName' },
  { title: '网站描述', dataIndex: 'webDescript', slotName: 'webDescript' },
  { title: '网站图片', dataIndex: 'webImg', slotName: 'webImg' },
  { title: '0为为审核通过 1为审核通过', dataIndex: 'webAccess', slotName: 'webAccess' },
  { title: '用户邮箱', dataIndex: 'webEmail', slotName: 'webEmail' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['blog:friendlink:get', 'blog:friendlink:update', 'blog:friendlink:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.webName = undefined
  queryForm.webAccess = undefined
  queryForm.webEmail = undefined
  queryForm.createTime = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: FriendlinkResp) => {
  return handleDelete(() => deleteFriendlink(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportFriendlink(queryForm))
}

const FriendlinkAddModalRef = ref<InstanceType<typeof FriendlinkAddModal>>()
// 新增
const onAdd = () => {
  FriendlinkAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: FriendlinkResp) => {
  FriendlinkAddModalRef.value?.onUpdate(record.id)
}

const FriendlinkDetailDrawerRef = ref<InstanceType<typeof FriendlinkDetailDrawer>>()
// 详情
const onDetail = (record: FriendlinkResp) => {
  FriendlinkDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
