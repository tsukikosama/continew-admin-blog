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
import { getTag, addTag, updateTag } from '@/apis/blog/tag'
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
const title = computed(() => (isUpdate.value ? '修改标签' : '新增标签'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
  name: '',
  imgUrl:'',
})

const columns: ColumnItem[] = reactive([
  {
    label: '标签名称',
    field: 'name',
    type: 'input',
    span: 24,
  },
  {
    label: '标签名称',
    field: 'name',
    type: 'upload',
    span: 24,
    props: {
      action: `${import.meta.env.VITE_API_BASE_URL}/common/file`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`  // 或其他你的 token 格式
      },
      limit:1,
      multiple: true,
      listType: 'picture-card',
      onPreview: (file) => {
        // ✅ 点击图片时预览，可以打开新窗口或自定义弹窗
        window.open(file.url || file.response?.url, '_blank')
      },
      fileList: computed(() => {
        if (!form.imgUrl) return [];
        return toFileList(form.imgUrl);
      }),
      accept: '.jpg,.jpeg,.png',
      onSuccess:(fileItem)=>{
        form.imgUrl = fileItem.response.data?.url
      },
      onBeforeRemove:(fileItem)=>{
        form.imgUrl = '';
      },
    },
  },
])

const toFileList = (urls: string[] | string | undefined): { name: string, url: string }[] => {
  if (!urls || (typeof urls === 'string' && urls.trim() === '')) {
    return [];
  }

  // 如果是字符串就转成数组
  const urlList = Array.isArray(urls) ? urls : urls.split(',');

  return urlList
      .filter((url) => !!url && url.trim().length > 0)
      .map((url) => {
        const parts = url.split('/').pop();
        return {
          name: parts ?? '文件',
          url: url
        };
      });
};
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
      await updateTag(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addTag(form)
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
  const { data } = await getTag(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
