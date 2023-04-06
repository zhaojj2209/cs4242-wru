import { EventChat } from './types'

export const sortInRecommendedOrder = (events: EventChat[]) => {
  return events
}

export const getSearchedEventsInOrder = (events: EventChat[], searchQuery: string) => {
  const eventsToDisplay: EventChat[] = []
  events.forEach((event) => {
    if (event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      eventsToDisplay.push(event)
    } else if (event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      eventsToDisplay.push(event)
    } else if (event.location.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      eventsToDisplay.push(event)
    } else {
      for (const tag in event.tags) {
        if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
          eventsToDisplay.push(event)
          break
        }
      }
    }
  })
  return eventsToDisplay
}
