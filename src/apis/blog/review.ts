import http from '@/utils/http'

const BASE_URL = '/admin/review'

export interface ReviewResp {
  id: string
  content: string
  likes: string
  blogId: string
  replyId: string
  userId: string
  reviewType: string
  replyUserId: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ReviewDetailResp {
  id: string
  content: string
  likes: string
  blogId: string
  replyId: string
  userId: string
  reviewType: string
  replyUserId: string
  createTime: string
  createUserString: string
  updateUserString: string
}
export interface ReviewQuery {
  reviewType: string | undefined
  sort: Array<string>
}
export interface ReviewPageQuery extends ReviewQuery, PageQuery {}

/** @desc 查询评论列表 */
export function listReview(query: ReviewPageQuery) {
  return http.get<PageRes<ReviewResp[]>>(BASE_URL, query)
}

/** @desc 查询评论详情 */
export function getReview(id: string) {
  return http.get<ReviewDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增评论 */
export function addReview(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改评论 */
export function updateReview(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除评论 */
export function deleteReview(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出评论 */
export function exportReview(query: ReviewQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
