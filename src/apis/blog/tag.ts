import http from '@/utils/http'
import type {LabelValueState} from "@/types/global";
import {listTagDict} from "@/apis";

const BASE_URL = '/admin/tag'

export interface TagResp {
  id: string
  name: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface TagDetailResp {
  id: string
  name: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface TagQuery {
  name: string | undefined
  sort: Array<string>
}
export interface TagPageQuery extends TagQuery, PageQuery {}

/** @desc 查询标签列表 */
export function listTag(query: TagPageQuery) {
  return http.get<PageRes<TagResp[]>>(BASE_URL, query)
}

/** @desc 查询标签详情 */
export function getTag(id: string) {
  return http.get<TagDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增标签 */
export function addTag(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改标签 */
export function updateTag(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除标签 */
export function deleteTag(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出标签 */
export function exportTag(query: TagQuery) {
  return http.download(`${BASE_URL}/export`, query)
}


/** 客户模块 */
export function useTag(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const tagList = ref<LabelValueState[]>([])

  const getTagList = async () => {
    try {
      loading.value = true
      const res = await listTagDict()
      tagList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }
  return { tagList, getTagList, loading }
}
