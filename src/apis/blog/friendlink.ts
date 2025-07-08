import http from '@/utils/http'

const BASE_URL = '/admin/friendlink'

export interface FriendlinkResp {
  id: string
  webUrl: string
  webName: string
  webDescript: string
  webImg: string
  webAccess: string
  webEmail: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface FriendlinkDetailResp {
  id: string
  webUrl: string
  webName: string
  webDescript: string
  webTime: string
  webImg: string
  webAccess: string
  webEmail: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  createUserString: string
  updateUserString: string
}
export interface FriendlinkQuery {
  webName: string | undefined
  webAccess: string | undefined
  webEmail: string | undefined
  createTime: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface FriendlinkPageQuery extends FriendlinkQuery, PageQuery {}

/** @desc 查询友链列表 */
export function listFriendlink(query: FriendlinkPageQuery) {
  return http.get<PageRes<FriendlinkResp[]>>(BASE_URL, query)
}

/** @desc 查询友链详情 */
export function getFriendlink(id: string) {
  return http.get<FriendlinkDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增友链 */
export function addFriendlink(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改友链 */
export function updateFriendlink(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除友链 */
export function deleteFriendlink(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出友链 */
export function exportFriendlink(query: FriendlinkQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
