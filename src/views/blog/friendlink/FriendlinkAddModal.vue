<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getFriendlink, addFriendlink, updateFriendlink } from '@/apis/blog/friendlink'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const {friend_link_access_status, friend_link_access_status_enum} = useDict('friend_link_access_status', 'friend_link_access_status_enum')


const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改友链' : '新增友链'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '网站链接',
    field: 'webUrl',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '网站名字',
    field: 'webName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '网站图片',
    field: 'webImg',
    type: 'input',
    span: 24,
  },
  {
    label: '网站描述',
    field: 'webDescript',
    type: 'input',
    span: 24,
  },
  {
    label: '审核状态',
    field: 'webAccess',
    type: 'radio-group',
    props:{
      placeholder: '请选择状态',
      options:friend_link_access_status
    },
    span: 24,
    required: true,
  },
  {
    label: '用户邮箱',
    field: 'webEmail',
    type: 'input',
    span: 24,
    required: true,

  },

])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateFriendlink(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addFriendlink(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getFriendlink(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
