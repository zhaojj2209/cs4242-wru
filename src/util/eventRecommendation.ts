import { stopwords } from './stopwords'
import { EventChat, GoogLatLng } from './types'

export const sortInRecommendedOrder = (events: EventChat[]) => {
  return events
}

// Search order

const TITLE_WEIGHT = 0.3
const DESC_WEIGHT = 0.25
const LOCN_WEIGHT = 0.25
const TAGS_WEIGHT = 0.2

export const getSearchedEventsInOrder = (
  events: EventChat[],
  searchQuery: string,
  currLoc?: GoogLatLng
) => {
  const queryTokens = tokenizeAndRemoveStopwords(searchQuery)
  const eventsToDisplay: EventChat[] = []
  const scores: { [key: string]: number } = {}
  events.forEach((event) => {
    const titleScore = calcMatchRatio(tokenizeAndRemoveStopwords(event.title), queryTokens)
    const descScore = calcMatchRatio(tokenizeAndRemoveStopwords(event.description), queryTokens)
    const locnScore = calcMatchRatio(
      tokenizeAndRemoveStopwords(event.location.description),
      queryTokens
    )
    const tagsScore = calcMatchRatio(event.tags, queryTokens)
    const totalScore =
      titleScore * TITLE_WEIGHT +
      descScore * DESC_WEIGHT +
      locnScore * LOCN_WEIGHT +
      tagsScore * TAGS_WEIGHT
    if (totalScore > 0) {
      eventsToDisplay.push(event)
      if (currLoc) {
        const distScore = getDistanceScore(event.location.location, currLoc)
        scores[event.id] = distScore + totalScore
      } else {
        scores[event.id] = totalScore
      }
    }
  })
  eventsToDisplay.sort((a, b) => scores[b.id] - scores[a.id])
  return eventsToDisplay
}

const tokenizeAndRemoveStopwords = (str: string) =>
  removeStopwords(str.toLocaleLowerCase().split(' '))

const removeStopwords = (tokens: string[]) => tokens.filter((token) => !stopwords.includes(token))

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
  const p = Math.PI / 180
  const c = Math.cos
  const a =
    0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2

  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}
