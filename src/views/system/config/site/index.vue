<template>
  <div class="gi_page">
    <a-spin :loading="loading">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        layout="vertical"
        :disabled="!isUpdate"
        class="form"
      >
        <a-form-item class="image-item" field="SITE_LOGO" hide-label>
          {{ siteConfig.SITE_LOGO.name }}
          <template #extra>
            {{ siteConfig.SITE_LOGO.description }}
            <br />
            <a-upload
              :file-list="logoFile ? [logoFile] : []" accept="image/*" :show-file-list="false"
              :custom-request="handleUploadLogo" @change="handleChangeLogo"
            >
              <template #upload-button>
                <div
                  :class="`arco-upload-list-item${logoFile && logoFile.status === 'error' ? ' arco-upload-list-item-error' : ''
                  }`"
                >
                  <div v-if="logoFile && logoFile.url" class="arco-upload-list-picture custom-upload-avatar logo">
                    <img :src="logoFile.url" alt="Logo" />
                    <div v-if="isUpdate" class="arco-upload-list-picture-mask logo">
                      <IconEdit />
                    </div>
                  </div>
                  <div v-else class="arco-upload-picture-card logo">
                    <div class="arco-upload-picture-card-text">
                      <icon-upload />
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </template>
        </a-form-item>
        <a-form-item class="image-item" field="SITE_FAVICON" hide-label>
          {{ siteConfig.SITE_FAVICON.name }}
          <template #extra>
            {{ siteConfig.SITE_FAVICON.description }}
            <br />
            <a-upload
              :file-list="faviconFile ? [faviconFile] : []" accept="image/*" :show-file-list="false"
              :custom-request="handleUploadFavicon" @change="handleChangeFavicon"
            >
              <template #upload-button>
                <div
                  :class="`arco-upload-list-item${faviconFile && faviconFile.status === 'error' ? ' arco-upload-list-item-error' : ''
                  }`"
                >
                  <div
                    v-if="faviconFile && faviconFile.url"
                    class="arco-upload-list-picture custom-upload-avatar favicon"
                  >
                    <img :src="faviconFile.url" alt="favicon" />
                    <div v-if="isUpdate" class="arco-upload-list-picture-mask favicon">
                      <IconEdit />
                    </div>
                  </div>
                  <div v-else class="arco-upload-picture-card favicon">
                    <div class="arco-upload-picture-card-text">
                      <icon-upload />
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </template>
        </a-form-item>
        <a-form-item class="input-item" field="SITE_TITLE" :label="siteConfig.SITE_TITLE.name" :help="siteConfig.SITE_TITLE.description">
          <a-input v-model.trim="form.SITE_TITLE" placeholder="请输入系统名称" :max-length="18" show-word-limit />
        </a-form-item>
        <a-form-item class="input-item" field="SITE_DESCRIPTION" :label="siteConfig.SITE_DESCRIPTION.name" :help="siteConfig.SITE_DESCRIPTION.description">
          <a-textarea
            v-model.trim="form.SITE_DESCRIPTION"
            placeholder="请输入系统描述"
            :auto-size="{ minRows: 1, maxRows: 3 }"
          />
        </a-form-item>
        <a-form-item class="input-item" field="SITE_COPYRIGHT" :label="siteConfig.SITE_COPYRIGHT.name" :help="siteConfig.SITE_COPYRIGHT.description">
          <a-input v-model.trim="form.SITE_COPYRIGHT" placeholder="请输入版权声明" />
        </a-form-item>
        <a-form-item field="SITE_BEIAN" :label="siteConfig.SITE_BEIAN.name" :help="siteConfig.SITE_BEIAN.description">
          <a-input v-model.trim="form.SITE_BEIAN" placeholder="请输入备案号" :max-length="30" show-word-limit />
        </a-form-item>
        <a-space style="margin-top: 16px">
          <a-button v-if="!isUpdate" v-permission="['system:siteConfig:update']" type="primary" @click="onUpdate">
            <template #icon>
              <icon-edit />
            </template>修改
          </a-button>
          <a-button v-if="!isUpdate" v-permission="['system:siteConfig:update']" @click="onResetValue">
            <template #icon>
              <icon-undo />
            </template>恢复默认
          </a-button>
          <a-button v-if="isUpdate" type="primary" @click="handleSave">
            <template #icon>
              <icon-save />
            </template>保存
          </a-button>
          <a-button v-if="isUpdate" @click="reset">
            <template #icon>
              <icon-refresh />
            </template>重置
          </a-button>
          <a-button v-if="isUpdate" @click="handleCancel">
            <template #icon>
              <icon-undo />
            </template>取消
          </a-button>
        </a-space>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { type FileItem, type FormInstance, Message, Modal, type RequestOption } from '@arco-design/web-vue'
import {
  type OptionResp,
  type SiteConfig,
  listOption,
  resetOptionValue,
  updateOption,
} from '@/apis/system'
import { useAppStore } from '@/stores'
import { useResetReactive } from '@/hooks'
import { fileToBase64 } from '@/utils'

defineOptions({ name: 'SystemSiteConfig' })

const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const [form] = useResetReactive({
  SITE_FAVICON: '',
  SITE_LOGO: '',
  SITE_TITLE: '',
  SITE_COPYRIGHT: '',
})
const rules: FormInstance['rules'] = {
  SITE_TITLE: [{ required: true, message: '请输入系统名称' }],
  SITE_DESCRIPTION: [{ required: true, message: '请输入系统描述' }],
  SITE_COPYRIGHT: [{ required: true, message: '请输入版权声明' }],
}

const siteConfig = ref<SiteConfig>({
  SITE_FAVICON: {},
  SITE_LOGO: {},
  SITE_TITLE: {},
  SITE_DESCRIPTION: {},
  SITE_COPYRIGHT: {},
  SITE_BEIAN: {},
})
const faviconFile = ref<FileItem>({ uid: '-1' })
const logoFile = ref<FileItem>({ uid: '-2' })
// 重置
const reset = () => {
  formRef.value?.resetFields()
  form.SITE_FAVICON = siteConfig.value.SITE_FAVICON.value || ''
  form.SITE_LOGO = siteConfig.value.SITE_LOGO.value || ''
  form.SITE_TITLE = siteConfig.value.SITE_TITLE.value || ''
  form.SITE_DESCRIPTION = siteConfig.value.SITE_DESCRIPTION.value || ''
  form.SITE_COPYRIGHT = siteConfig.value.SITE_COPYRIGHT.value || ''
  form.SITE_BEIAN = siteConfig.value.SITE_BEIAN.value || ''
  faviconFile.value.url = siteConfig.value.SITE_FAVICON.value
  logoFile.value.url = siteConfig.value.SITE_LOGO.value
}

const isUpdate = ref(false)
// 修改
const onUpdate = () => {
  isUpdate.value = true
}

// 取消
const handleCancel = () => {
  reset()
  isUpdate.value = false
}

const queryForm = reactive({
  category: 'SITE',
})
// 查询列表数据
const getDataList = async () => {
  loading.value = true
  const { data } = await listOption(queryForm)
  siteConfig.value = data.reduce((obj: SiteConfig, option: OptionResp) => {
    obj[option.code] = { ...option }
    return obj
  }, {})
  handleCancel()
  loading.value = false
}

const appStore = useAppStore()
// 保存
const handleSave = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) return false
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: siteConfig.value[key].id, code: key, value }
    }),
  )
  appStore.setSiteConfig(form)
  await getDataList()
  Message.success('保存成功')
}

// 恢复默认
const handleResetValue = async () => {
  await resetOptionValue(queryForm)
  Message.success('恢复成功')
  await getDataList()
  appStore.setSiteConfig(form)
}
const onResetValue = () => {
  Modal.warning({
    title: '警告',
    content: '确认恢复基础配置为默认值吗？',
    hideCancel: false,
    maskClosable: false,
    onOk: handleResetValue,
  })
}

// 上传 favicon
const handleUploadFavicon = (options: RequestOption) => {
  const controller = new AbortController()
  ;(async function requestWrap() {
    const { onProgress, onError, onSuccess, fileItem } = options
    onProgress(20)
    if (!fileItem.file) {
      return
    }
    fileToBase64(fileItem.file).then()
      .then((res) => {
        onSuccess()
        form.SITE_FAVICON = res
        Message.success('上传成功')
      })
      .catch((error) => {
        onError(error)
      })
  })()
  return {
    abort() {
      controller.abort()
    },
  }
}
const handleChangeFavicon = (_: any, currentFile: any) => {
  faviconFile.value = {
    ...currentFile,
  }
}

// 上传 Logo
const handleUploadLogo = (options: RequestOption) => {
  const controller = new AbortController()
  ;(async function requestWrap() {
    const { onProgress, onError, onSuccess, fileItem } = options
    onProgress(20)
    if (!fileItem.file) {
      return
    }
    fileToBase64(fileItem.file).then()
      .then((res) => {
        onSuccess()
        form.SITE_LOGO = res
        Message.success('上传成功')
      })
      .catch((error) => {
        onError(error)
      })
  })()
  return {
    abort() {
      controller.abort()
    },
  }
}
const handleChangeLogo = (_: any, currentFile: any) => {
  logoFile.value = {
    ...currentFile,
  }
}

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss">
.logo {
  width: 50px;
  height: 50px;
  min-width: 50px;
  line-height: 50px;
}

.favicon {
  width: 46px;
  height: 46px;
  min-width: 46px;
  line-height: 46px;
}

:deep(.form .arco-input-wrapper),
:deep(.form .arco-textarea-wrapper) {
  width: 500px;
}

.arco-form .image-item,
.input-item {
  margin-bottom: 5px;
}

:deep(.arco-form-item-layout-vertical > .arco-form-item-label-col) {
  margin-bottom: 0;
}

// responsive
:deep(.mobile .form .arco-input-wrapper),
:deep(.mobile .form .arco-textarea-wrapper) {
  width: 100%;
}
</style>
