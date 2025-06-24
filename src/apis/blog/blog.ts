import http from '@/utils/http'

const BASE_URL = 'admin/ccblog'

export interface BlogResp {
  id: string
  title: string
  picture: string
  content: string
  isValid: string
  visit: string
  simpleTitle: string
  userId: string
  state: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface BlogDetailResp {
  id: string
  title: string
  picture: string
  content: string
  isValid: string
  version: string
  visit: string
  simpleTitle: string
  userId: string
  state: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  createUserString: string
  updateUserString: string
}
export interface BlogQuery {
  title: string | undefined
  isValid: string | undefined
  simpleTitle: string | undefined
  userId: string | undefined
  state: string | undefined
  createTime: string | undefined
  sort: Array<string>
}
export interface BlogPageQuery extends BlogQuery, PageQuery {}

/** @desc 查询博客列表 */
export function listBlog(query: BlogPageQuery) {
  return http.get<PageRes<BlogResp[]>>(BASE_URL, query)
}

/** @desc 查询博客详情 */
export function getBlog(id: string) {
  return http.get<BlogDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增博客 */
export function addBlog(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改博客 */
export function updateBlog(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除博客 */
export function deleteBlog(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出博客 */
export function exportBlog(query: BlogQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
