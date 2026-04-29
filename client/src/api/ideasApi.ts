import type { IdeaRow } from '../types/domain'
import { http } from './http'

export type IdeaCategory =
  | 'promoter-buying'
  | 'whale-buying'
  | 'capex'
  | 'mergers'
  | 'fundamentals'

export async function fetchIdeasByCategory(category: IdeaCategory): Promise<IdeaRow[]> {
  const { data } = await http.get(`/ideas/${category}`)
  return data.data
}

export async function fetchAllIdeas(): Promise<IdeaRow[]> {
  const categories: IdeaCategory[] = ['promoter-buying', 'whale-buying', 'capex', 'mergers', 'fundamentals']

  const responses = await Promise.allSettled(categories.map((category) => fetchIdeasByCategory(category)))

  return responses
    .filter((response): response is PromiseFulfilledResult<IdeaRow[]> => response.status === 'fulfilled')
    .flatMap((response) => response.value)
}
