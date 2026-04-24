export interface FaqRecord {
  id: number
  question: string
  answer: string
  answer_sv: string | null
  video_link: string | null
  gym_ids: number[]
  gyms: Array<{ id: number; name: string }>
  created_at?: string
  updated_at?: string
}
