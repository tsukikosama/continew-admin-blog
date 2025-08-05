<template>
  <a-modal
      v-model:visible="visible"
      :title="title"
      :mask-closable="false"
      :esc-to-close="false"
      :width="width >= 1000 ? 1000 : '100%'"
      draggable
      @before-ok="save"
      @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" >
      <template #content>
        <div v-if="visible" style="border: 1px solid #ccc">
          <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :default-config="toolbarConfig"
          />
          <Editor
              style="height: 500px; overflow-y: auto"
              v-model="form.content"
              :default-config="editorConfig"
              @onCreated="handleCreated"
          />
        </div>
      </template>

<!--    <template #status>-->
<!--      <a-radio-group :options="blog_status" v-model="form.status">-->

<!--      </a-radio-group>-->
<!--    </template>-->
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getBlog, addBlog, updateBlog } from '@/apis/blog/blog'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

import {Editor, Toolbar} from '@wangeditor/editor-for-vue'

import '@wangeditor/editor/dist/css/style.css'
import {listTagDict} from "@/apis";
import {useTag} from "@/apis/blog/tag";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const {blog_status, blog_status_enum} = useDict('blog_status', 'blog_status_enum')

const { tagList,getTagList } = useTag()


getTagList()


const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改博客' : '新增博客'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
  title:'',
  content:'',
  status:undefined,
  simpleTitle:'',
  picture:'',
  tagId:[]
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
    label: '简化标题',
    field: 'simpleTitle',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '内容',
    field: 'content',
    span: 24,
    required: true,
  },
  {
    label: '图片',
    field: 'picture',
    type: 'upload',
    span: 24,
    // rules: [{required: true, message: '请选择图片'}],
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
        if (!form.picture) return [];
        // console.log(form.previewImage ,"computed")
        return toFileList(form.picture);
      }),
      accept: '.jpg,.jpeg,.png',
      onSuccess:(fileItem)=>{
        // console.log(fileItem.response.data?.url,"success")
        form.picture = fileItem.response.data?.url
      },
      onBeforeRemove:(fileItem)=>{
        // console.log(fileItem.url)
        form.picture = '';
        // console.log(fileItem,"remove")
      },
    },
  },

  {
    label: '标签',
    field: 'tagId',
    type: "select",
    props: {
      placeholder: '请选择标签',
      options: tagList,
      multiple:true,
    },
    required: true,
  },
  {
    label: '状态',
    field: 'status',
    type: "radio-group",
    props:{
      options:blog_status
    },

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

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const closeEdit = () => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
}

// 编辑器实例（必须用 shallowRef）
const editorRef = shallowRef()

const handleCreated = (editor) => {
  editorRef.value = editor
}

// 配置项
const toolbarConfig = {

}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: `${import.meta.env.VITE_API_BASE_URL}common/file`,
      fieldName: 'file', // 上传字段名，后端要对应
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      maxFileSize: 2 * 1024 * 1024, // 2MB
      allowedFileTypes: ['image/*'], // 限制类型
      customInsert(res, insertFn) {
        // 假设后端返回格式如下：
        console.log(res,insertFn)
        const url = res.data?.url || ''
        const alt = '图片'
        const href = url
        // ✅ 调用 insertFn 插入图片
        insertFn(url, alt, href)
      },
    }
  }
}

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

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
