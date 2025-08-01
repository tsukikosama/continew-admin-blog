<template>
  <a-modal
    v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 500 ? 500 : '100%'" draggable @before-ok="save" @ok="saveAfter" @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <template #captcha>
        <a-input v-model="form.captcha" placeholder="请输入验证码" :max-length="6" allow-clear style="flex: 1 1" />
        <a-button
          class="captcha-btn" :loading="captchaLoading" :disabled="captchaDisable" size="large"
          @click="onCaptcha"
        >
          {{ captchaBtnName }}
        </a-button>
      </template>
    </GiForm>
    <Verify
      ref="VerifyRef" :captcha-type="captchaType" :mode="captchaMode"
      :img-size="{ width: '330px', height: '155px' }" @success="getCaptcha"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import NProgress from 'nprogress'
import { type BehaviorCaptchaReq, getEmailCaptcha, getSmsCaptcha, updateUserEmail, updateUserPassword, updateUserPhone } from '@/apis'
import { encryptByRsa } from '@/utils/encrypt'
import { useUserStore } from '@/stores'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import * as Regexp from '@/utils/regexp'
import modalErrorWrapper from '@/utils/modal-error-wrapper'
import router from '@/router'

const { width } = useWindowSize()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const verifyType = ref()
const title = computed(
  () => `修改${verifyType.value === 'phone' ? '手机号' : verifyType.value === 'email' ? '邮箱' : '密码'}`,
)
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  phone: '',
  email: '',
  captcha: '',
  oldPassword: '',
  newPassword: '',
  rePassword: '',
})

const columns: ColumnItem[] = reactive([
  {
    label: '手机号',
    field: 'phone',
    type: 'input',
    span: 24,
    props: {
      showWordLimit: false,
    },
    rules: [
      { required: true, message: '请输入手机号' },
      { match: Regexp.Phone, message: '请输入正确的手机号' },
    ],
    hide: () => {
      return verifyType.value !== 'phone'
    },
  },
  {
    label: '邮箱',
    field: 'email',
    type: 'input',
    span: 24,
    rules: [
      { required: true, message: '请输入邮箱' },
      { match: Regexp.Email, message: '请输入正确的邮箱' },
    ],
    hide: () => {
      return verifyType.value !== 'email'
    },
  },
  {
    label: '验证码',
    field: 'captcha',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入验证码' }],
    hide: () => {
      return !['phone', 'email'].includes(verifyType.value)
    },
  },
  {
    label: '当前密码',
    field: 'oldPassword',
    type: 'input-password',
    span: 24,
    rules: [{ required: true, message: '请输入当前密码' }],
    hide: () => {
      return !userInfo.value.pwdResetTime
    },
  },
  {
    label: '新密码',
    field: 'newPassword',
    type: 'input-password',
    span: 24,
    rules: [
      { required: true, message: '请输入新密码' },
      {
        validator: (value, callback) => {
          if (value === form.oldPassword) {
            callback('新密码不能与当前密码相同')
          } else {
            callback()
          }
        },
      },
    ],
    hide: () => {
      return verifyType.value !== 'password'
    },
  },
  {
    label: '确认新密码',
    field: 'rePassword',
    type: 'input-password',
    span: 24,
    props: {
      placeholder: '请再次输入新密码',
    },
    rules: [
      { required: true, message: '请再次输入新密码' },
      {
        validator: (value, callback) => {
          if (value !== form.newPassword) {
            callback('两次输入的密码不一致')
          } else {
            callback()
          }
        },
      },
    ],
    hide: () => {
      return verifyType.value !== 'password'
    },
  },
])

const VerifyRef = ref<InstanceType<any>>()
const captchaType = ref('blockPuzzle')
const captchaMode = ref('pop')
const captchaLoading = ref(false)
// 弹出行为验证码
const onCaptcha = async () => {
  if (captchaLoading.value) return
  const isInvalid = await formRef.value?.formRef?.validateField(verifyType.value === 'phone' ? 'phone' : 'email')
  if (isInvalid) return
  // 重置行为参数
  VerifyRef.value.instance.refresh()
  VerifyRef.value.show()
}

const captchaTimer = ref()
const captchaTime = ref(60)
const captchaBtnName = ref('获取验证码')
const captchaDisable = ref(false)
// 重置验证码
const resetCaptcha = () => {
  window.clearInterval(captchaTimer.value)
  captchaTime.value = 60
  captchaBtnName.value = '获取验证码'
  captchaDisable.value = false
}

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  resetCaptcha()
}

// 获取验证码
const getCaptcha = async (captchaReq: BehaviorCaptchaReq) => {
  // 发送验证码
  try {
    captchaLoading.value = true
    captchaBtnName.value = '发送中...'
    if (verifyType.value === 'phone') {
      await getSmsCaptcha(form.phone, captchaReq)
    } else if (verifyType.value === 'email') {
      await getEmailCaptcha(form.email, captchaReq)
    }
    captchaLoading.value = false
    captchaDisable.value = true
    captchaBtnName.value = `获取验证码(${(captchaTime.value -= 1)}s)`
    Message.success('发送成功')
    // Message.success('仅提供效果演示，实际使用请查看代码取消相关注释')
    captchaTimer.value = window.setInterval(() => {
      captchaTime.value -= 1
      captchaBtnName.value = `获取验证码(${captchaTime.value}s)`
      if (captchaTime.value <= 0) {
        resetCaptcha()
      }
    }, 1000)
  } catch (error) {
    resetCaptcha()
  } finally {
    captchaLoading.value = false
  }
}

// 保存
const save = async () => {
  const isInvalid = await formRef.value?.formRef?.validate()
  if (isInvalid) return false
  try {
    if (verifyType.value === 'phone') {
      await updateUserPhone({
        phone: form.phone,
        captcha: form.captcha,
        oldPassword: encryptByRsa(form.oldPassword) as string,
      })
      Message.success('修改成功')
    } else if (verifyType.value === 'email') {
      await updateUserEmail({
        email: form.email,
        captcha: form.captcha,
        oldPassword: encryptByRsa(form.oldPassword) as string,
      })
      Message.success('修改成功')
    } else if (verifyType.value === 'password') {
      if (form.newPassword !== form.rePassword) {
        Message.error('两次新密码不一致')
        return false
      }
      if (form.newPassword === form.oldPassword) {
        Message.error('新密码与旧密码不能相同')
        return false
      }
      await updateUserPassword({
        oldPassword: encryptByRsa(form.oldPassword) || '',
        newPassword: encryptByRsa(form.newPassword) || '',
      })
    }
    return true
  } catch (error) {
    return false
  }
}
const saveAfter = async () => {
  if (verifyType.value === 'password') {
    modalErrorWrapper({
      title: '提示',
      content: '密码修改成功! 请保存好新密码，并使用新密码重新登录',
      maskClosable: false,
      escToClose: false,
      okText: '重新登录',
      async onOk() {
        NProgress.done()
        const userStore = useUserStore()
        await userStore.logoutCallBack()
        await router.replace('/login')
      },
    })
  } else {
    // 修改成功后，重新获取用户信息
    await userStore.getInfo()
  }
}

const visible = ref(false)
// 打开弹框
const open = (type: string) => {
  verifyType.value = type
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.captcha-btn {
  margin-left: 12px;
  min-width: 98px;
  border-radius: 4px;
}
</style>
