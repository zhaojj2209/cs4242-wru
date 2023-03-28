import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

export interface EventChat {
  id: string
  title: string
  description: string
  startDate: Timestamp
  endDate: Timestamp
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

export interface EventChatFormParams {
  title: string
  description: string
  startDate: Date
  endDate: Date
  creator: string
  members: string[]
}
