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

export interface Message {
  _id: number
  text: string
  createdAt: Date
  user: {
    _id: number
    name: string
    avatar: string
  }
}
