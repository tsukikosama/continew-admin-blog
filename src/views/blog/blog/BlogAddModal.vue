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
import { getBlog, addBlog, updateBlog } from '@/apis/blog/blog'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改博客' : '新增博客'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '标题',
    field: 'title',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '内容',
    field: 'content',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '是否有效',
    field: 'isValid',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '流量数量',
    field: 'visit',
    type: 'input',
    span: 24,
  },
  {
    label: '简化标题',
    field: 'simpleTitle',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '0保存 1发布',
    field: 'state',
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
      await updateBlog(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addBlog(form)
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
  const { data } = await getBlog(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
