export interface EventChat {
  id: string
  title: string
  description: string
  date: {
    nanoseconds: number
    seconds: number
  }
  creator: string
  members: string[]
}
