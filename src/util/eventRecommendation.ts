import { auth } from '../db/firebase'
import { EventChat, GoogLatLng } from './types'

// Constants to speed up calculation
const p = Math.PI / 180
const c = Math.cos
const l = Math.log
const r = Math.sqrt
const inverselog20 = 1 / l(20)
const COLLECTION_SIZE = 'COLLECTION_SIZE'

// Event recommendation

const MEMBERS_REC_WEIGHT = 0.4
const TAGS_REC_WEIGHT = 0.4
const DIST_REC_WEIGHT = 0.2

export const sortInRecommendedOrder = (events: EventChat[], currLoc?: GoogLatLng) => {
  const joinedEvents = events.filter((event) => event.members.includes(auth.currentUser?.uid ?? ''))
  const otherUsers: string[] = []
  const tags: string[] = []
  joinedEvents.forEach((event) => {
    otherUsers.push(...event.members)
    tags.push(...event.tags)
  })
  const notJoinedEvents = events.filter(
    (event) => !event.members.includes(auth.currentUser?.uid ?? '')
  )
  const scores: { [key: string]: number } = {}
  notJoinedEvents.forEach((event) => {
    const numSharedMembers = otherUsers.filter((token) => event.members.includes(token)).length
    const membersScore = l(numSharedMembers + 1) * inverselog20
    const tagsScore = calcMatchRatio(tags, event.tags)
    const totalScore = membersScore * MEMBERS_REC_WEIGHT + tagsScore * TAGS_REC_WEIGHT
    if (currLoc) {
      const distScore = getDistanceScore(event.location.location, currLoc)
      scores[event.id] = (distScore * DIST_REC_WEIGHT) + totalScore
    } else {
      scores[event.id] = totalScore
    }
  })
  notJoinedEvents.sort((a, b) => scores[b.id] - scores[a.id])
  return notJoinedEvents
}

// Search order

const TITLE_SEARCH_WEIGHT = 0.3
const DESC_SEARCH_WEIGHT = 0.2
const LOCN_SEARCH_WEIGHT = 0.2
const TAGS_SEARCH_WEIGHT = 0.15
const DIST_SEARCH_WEIGHT = 0.15

export const getSearchedEventsInOrder = (
  events: EventChat[],
  searchQuery: string,
  titleIndex: { [key: string]: number },
  descIndex: { [key: string]: number },
  locnIndex: { [key: string]: number },
  tagsIndex: { [key: string]: number },
  currLoc?: GoogLatLng
) => {
  const queryTokens = tokenize(searchQuery)
  const eventsToDisplay: EventChat[] = []
  const scores: { [key: string]: number } = {}
  events.forEach((event) => {
    const titleScore = calcTfIdf(tokenize(event.title), queryTokens, titleIndex)
    const descScore = calcTfIdf(tokenize(event.description), queryTokens, descIndex)
    const locnScore = calcTfIdf(
      tokenize(event.location.description),
      queryTokens,
      locnIndex
    )
    const tagsScore = calcTfIdf(event.tags, queryTokens, tagsIndex)
    const totalScore =
      titleScore * TITLE_SEARCH_WEIGHT +
      descScore * DESC_SEARCH_WEIGHT +
      locnScore * LOCN_SEARCH_WEIGHT +
      tagsScore * TAGS_SEARCH_WEIGHT
    if (totalScore > 0) {
      eventsToDisplay.push(event)
      if (currLoc) {
        const distScore = getDistanceScore(event.location.location, currLoc)
        scores[event.id] = (distScore * DIST_SEARCH_WEIGHT) + totalScore
      } else {  
        scores[event.id] = totalScore
      }
    }
  })
  eventsToDisplay.sort((a, b) => scores[b.id] - scores[a.id])
  return eventsToDisplay
}

export const tokenize = (str: string) => str.toLocaleLowerCase().split(' ')

// Calculates percentage of tokens in the query that exist in the document
const calcMatchRatio = (docTokens: string[], queryTokens: string[]) => {
  if (queryTokens.length === 0) {
    return 0
  }
  const matchedWords = docTokens.filter((token) => queryTokens.includes(token))
  return matchedWords.length === 0 ? 0 : matchedWords.length / queryTokens.length
}

const getDistanceScore = (eventLoc: GoogLatLng, currLoc: GoogLatLng) => {
  return 1 - getDistance(eventLoc, currLoc) / 50
}

// Calculate distance in km via Haversine formula
// Taken from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
export const getDistance = (loc1: GoogLatLng, loc2: GoogLatLng) => {
  const lat1 = loc1.lat
  const lon1 = loc1.lng
  const lat2 = loc2.lat
  const lon2 = loc2.lng
  const a =
    0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2

  return 12742 * Math.asin(r(a)) // 2 * R; R = 6371 km
}

export const buildIndex = (docs: string[][]) => {
  const index: { [key: string]: number } = {}
  index[COLLECTION_SIZE] = docs.length
  docs.forEach((doc) => {
    const set = new Set(doc)
    set.forEach((token) => {
      if (index[token]) {
        index[token] = index[token] + 1
      } else {
        index[token] = 1
      }
    })
  })
  return index
}

const calcTfIdf = (docTokens: string[], queryTokens: string[], index: { [key: string]: number }) => {
  if (queryTokens.length === 0) {
    return 0
  }
  let sumSquares = 0
  queryTokens.forEach((token) => {
    const rawTf = docTokens.filter((docToken) => docToken === token).length
    const logTf = rawTf === 0 ? 0 : 1 + l(rawTf)
    const df = index[token] ?? 0
    const idf = df === 0 ? 0 : l(index[COLLECTION_SIZE]/df)
    const tfidf = logTf * idf
    sumSquares += tfidf ** 2
  })
  
  return 1 / r(sumSquares)
}
