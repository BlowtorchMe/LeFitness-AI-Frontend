export interface FaqRecord {
  id: number
  question: string
  answer: string
  video_link: string | null
  created_at?: string
  updated_at?: string
}
