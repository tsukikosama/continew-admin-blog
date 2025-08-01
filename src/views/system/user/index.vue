<template>
  <GiPageLayout>
    <template #left>
      <DeptTree @node-click="handleSelectDept" />
    </template>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1500 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['nickname']"
      @refresh="search"
    >
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset"></GiForm>
      </template>
      <template #toolbar-left>
        <a-button v-permission="['system:user:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:user:import']" @click="onImport">
          <template #icon><icon-upload /></template>
          <template #default>导入</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:user:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #nickname="{ record }">
        <GiCellAvatar :avatar="record.avatar" :name="record.nickname" />
      </template>
      <template #gender="{ record }">
        <GiCellGender :gender="record.gender" />
      </template>
      <template #roleNames="{ record }">
        <GiCellTags :data="record.roleNames" />
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #isSystem="{ record }">
        <a-tag v-if="record.isSystem" color="red" size="small">是</a-tag>
        <a-tag v-else color="arcoblue" size="small">否</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:user:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:user:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:user:delete']"
            status="danger"
            :disabled="record.isSystem"
            :title="record.isSystem ? '系统内置数据不能删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
          <a-dropdown>
            <a-button v-if="has.hasPermOr(['system:user:resetPwd', 'system:user:updateRole'])" type="text" size="mini" title="更多">
              <template #icon>
                <icon-more :size="16" />
              </template>
            </a-button>
            <template #content>
              <a-doption v-permission="['system:user:resetPwd']" title="重置密码" @click="onResetPwd(record)">重置密码</a-doption>
              <a-doption v-permission="['system:user:updateRole']" title="分配角色" @click="onUpdateRole(record)">分配角色</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </GiTable>

    <UserAddDrawer ref="UserAddDrawerRef" @save-success="search" />
    <UserImportDrawer ref="UserImportDrawerRef" @save-success="search" />
    <UserDetailDrawer ref="UserDetailDrawerRef" />
    <UserResetPwdModal ref="UserResetPwdModalRef" />
    <UserUpdateRoleModal ref="UserUpdateRoleModalRef" @save-success="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import DeptTree from './dept/index.vue'
import UserAddDrawer from './UserAddDrawer.vue'
import UserImportDrawer from './UserImportDrawer.vue'
import UserDetailDrawer from './UserDetailDrawer.vue'
import UserResetPwdModal from './UserResetPwdModal.vue'
import UserUpdateRoleModal from './UserUpdateRoleModal.vue'
import { type UserResp, deleteUser, exportUser, listUser } from '@/apis/system/user'
import { DisEnableStatusList } from '@/constant/common'
import { useDownload, useResetReactive, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import type { ColumnItem } from '@/components/GiForm'

defineOptions({ name: 'SystemUser' })

const [queryForm, resetForm] = useResetReactive({
  sort: ['t1.id,desc'],
})
const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '用户名',
    field: 'description',
    span: { xs: 24, sm: 8, xxl: 8 },
    props: {
      placeholder: '用户名/昵称/描述',
    },
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    span: { xs: 24, sm: 6, xxl: 8 },
    props: {
      options: DisEnableStatusList,
      placeholder: '请选择状态',
    },
  },
  {
    type: 'range-picker',
    label: '创建时间',
    field: 'createTime',
    span: { xs: 24, sm: 10, xxl: 8 },
  },
])

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listUser({ ...queryForm, ...page }), { immediate: false })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    slotName: 'nickname',
    minWidth: 140,
    ellipsis: true,
    tooltip: true,
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '用户名', dataIndex: 'username', slotName: 'username', minWidth: 140, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender', align: 'center' },
  { title: '所属部门', dataIndex: 'deptName', minWidth: 180, ellipsis: true, tooltip: true },
  { title: '角色', dataIndex: 'roleNames', slotName: 'roleNames', minWidth: 165 },
  { title: '手机号', dataIndex: 'phone', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '邮箱', dataIndex: 'email', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '系统内置', dataIndex: 'isSystem', slotName: 'isSystem', width: 100, align: 'center', show: false },
  { title: '描述', dataIndex: 'description', minWidth: 130, ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 190,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr([
      'system:user:get',
      'system:user:update',
      'system:user:delete',
      'system:user:resetPwd',
      'system:user:updateRole',
    ]),
  },
]

// 重置
const reset = () => {
  resetForm()
  search()
}

// 删除
const onDelete = (record: UserResp) => {
  return handleDelete(() => deleteUser(record.id), {
    content: `是否确定删除用户「${record.nickname}(${record.username})」？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportUser(queryForm))
}

// 根据选中部门查询
const handleSelectDept = (keys: Array<any>) => {
  queryForm.deptId = keys.length === 1 ? keys[0] : undefined
  search()
}

const UserImportDrawerRef = ref<InstanceType<typeof UserImportDrawer>>()
// 导入
const onImport = () => {
  UserImportDrawerRef.value?.onOpen()
}

const UserAddDrawerRef = ref<InstanceType<typeof UserAddDrawer>>()
// 新增
const onAdd = () => {
  UserAddDrawerRef.value?.onAdd()
}

// 修改
const onUpdate = (record: UserResp) => {
  UserAddDrawerRef.value?.onUpdate(record.id)
}

const UserDetailDrawerRef = ref<InstanceType<typeof UserDetailDrawer>>()
// 详情
const onDetail = (record: UserResp) => {
  UserDetailDrawerRef.value?.onOpen(record.id)
}

const UserResetPwdModalRef = ref<InstanceType<typeof UserResetPwdModal>>()
// 重置密码
const onResetPwd = (record: UserResp) => {
  UserResetPwdModalRef.value?.onOpen(record.id)
}

const UserUpdateRoleModalRef = ref<InstanceType<typeof UserUpdateRoleModal>>()
// 分配角色
const onUpdateRole = (record: UserResp) => {
  UserUpdateRoleModalRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
.page_header {
  flex: 0 0 auto;
}

.page_content {
  flex: 1;
  overflow: auto;
}
</style>
