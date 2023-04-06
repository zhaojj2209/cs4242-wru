import { stopwords } from './stopwords'
import { EventChat } from './types'

export const sortInRecommendedOrder = (events: EventChat[]) => {
  return events
}

// Search order

const TITLE_WEIGHT = 0.3
const DESC_WEIGHT = 0.25
const LOCN_WEIGHT = 0.25
const TAGS_WEIGHT = 0.2

export const getSearchedEventsInOrder = (events: EventChat[], searchQuery: string) => {
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
      scores[event.id] = totalScore
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
