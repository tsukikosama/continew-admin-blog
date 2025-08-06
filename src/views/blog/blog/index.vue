<template>
  <div class="gi_table_page">
    <GiTable
        title="博客管理"
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
        <a-input-search v-model="queryForm.title" placeholder="请输入标题" allow-clear @search="search" />
        <a-select
            v-model="queryForm.tagId"
                  placeholder="请选择标签"
                  allow-clear
                  @change="search"
                  :options="tagList"
                   >
        </a-select>
        <a-input-search v-model="queryForm.userId" placeholder="请输入用户名" allow-clear @search="search" />
        <a-select  v-model="queryForm.status" :options="blog_status" placeholder="请输选择博客状态" allow-clear @change="search" />
        <DateRangePicker v-model="queryForm.createTime" @change="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['blog:blog:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['blog:blog:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['blog:blog:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['blog:blog:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
              v-permission="['blog:blog:delete']"
              status="danger"
              :disabled="record.disabled"
              :title="record.disabled ? '不可删除' : '删除'"
              @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
      <template #picture =" {record}">
        <a-image
            width="50"
            :src="record.picture"
        />
      </template>
      <template #status = "{ record } ">
        <a-tag  :color="record?.status === 1 ? 'green' : 'orange'">{{getBlogStatus(record?.status)?.label}}</a-tag>

      </template>

      <template #tagId = "{ record } ">
        <a-space>
          <a-tag color="blue" v-for="(item,index) in record.tagId" :key="index">{{ getTagNameByTagId(item)?.label }}</a-tag>
        </a-space>
      </template>
    </GiTable>

    <BlogAddModal ref="BlogAddModalRef" @save-success="search" />
    <BlogDetailDrawer ref="BlogDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import BlogAddModal from './BlogAddModal.vue'
import BlogDetailDrawer from './BlogDetailDrawer.vue'
import { type BlogResp, type BlogQuery, deleteBlog, exportBlog, listBlog } from '@/apis/blog/blog'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import {listTagDict} from "@/apis";
import {useTag} from "@/apis/blog/tag";
import {Tooltip} from "@arco-design/web-vue";
import GiCellTag from '@/components/GiCell/GiCellTag.vue'
import GiCellTags from '@/components/GiCell/GiCellTags.vue'
import GiCellStatus from '@/components/GiCell/GiCellStatus.vue'

defineOptions({ name: 'Blog' })


const { tagList,getTagList } = useTag()


getTagList()

const queryForm = reactive<BlogQuery>({
  title: undefined,
  simpleTitle: undefined,
  userId: undefined,
  status: undefined,
  createTime: undefined,
  tagId:undefined,
  sort: ['id,desc']
})

const {blog_status} = useDict('blog_status')

const getBlogStatus = (status) => {
  return blog_status.value.find(item => item.value == status)
}
listTagDict()
const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listBlog({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '标题', dataIndex: 'title', slotName: 'title' },
  { title: '标签', dataIndex: 'tagId', slotName: 'tagId', width: 100 },
  { title: '图片', dataIndex: 'picture', slotName: 'picture' },
  { title: '内容', dataIndex: 'content', slotName: 'content',ellipsis:true,tooltip: true, },
  { title: '浏览数量', dataIndex: 'visit', slotName: 'visit' },
  { title: '简化标题', dataIndex: 'simpleTitle', slotName: 'simpleTitle' },
  { title: '用户作者', dataIndex: 'nickname', slotName: 'nickname' },
  { title: '状态', dataIndex: 'status', slotName: 'status'
  },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['blog:blog:get', 'blog:blog:update', 'blog:blog:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.simpleTitle = undefined
  queryForm.userId = undefined
  queryForm.status = undefined
  queryForm.createTime = undefined
  search()
}

// 删除
const onDelete = (record: BlogResp) => {
  return handleDelete(() => deleteBlog(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportBlog(queryForm))
}

const BlogAddModalRef = ref<InstanceType<typeof BlogAddModal>>()
// 新增
const onAdd = () => {
  BlogAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: BlogResp) => {
  BlogAddModalRef.value?.onUpdate(record.id)
}

const BlogDetailDrawerRef = ref<InstanceType<typeof BlogDetailDrawer>>()
// 详情
const onDetail = (record: BlogResp) => {
  BlogDetailDrawerRef.value?.onOpen(record.id)
}

const getTagNameByTagId = (id : number) => {
  return tagList.value.find(item => item.value == id)
}
</script>

<style scoped lang="scss"></style>
