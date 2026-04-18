export interface GymRecord {
  id: number
  name: string
  slug: string
  location: string
  phone: string | null
  booking_url: string
  calendar_id: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}
