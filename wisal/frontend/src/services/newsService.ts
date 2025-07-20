import axios from 'axios'

export interface NewsArticle {
  date: string
  headline: string
  image: string
  logo: string
  source: string
  text: string
  url: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const NEWSCORD_API_URL = 'https://europe-west2-unbiased-reporting.cloudfunctions.net/get-aj'

export const newsService = {
  /**
   * Fetch news articles from NewsCord API
   * @param page Current page number
   * @param limit Number of items per page
   * @returns Paginated news articles
   */
  async getNews(page: number = 1, limit: number = 12): Promise<NewsResponse> {
    try {
      // NewsCord API uses mode parameter
      const response = await axios.get(NEWSCORD_API_URL, {
        params: {
          mode: '"all_pro_p"'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      // Extract articles from the response
      const allArticles: NewsArticle[] = response.data || []
      
      // Calculate pagination
      const total = allArticles.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      // Get paginated articles
      const paginatedArticles = allArticles.slice(startIndex, endIndex)

      return {
        articles: paginatedArticles,
        total,
        page,
        limit,
        totalPages
      }
    } catch (error) {
      console.error('Failed to fetch news articles:', error)
      throw new Error('Failed to fetch news articles')
    }
  },

  /**
   * Search news articles by keyword
   * @param query Search query
   * @param page Current page number
   * @param limit Number of items per page
   * @returns Filtered and paginated news articles
   */
  async searchNews(query: string, page: number = 1, limit: number = 12): Promise<NewsResponse> {
    try {
      const response = await this.getNews(1, 1000) // Get all articles for client-side filtering
      
      // Filter articles based on query
      const filteredArticles = response.articles.filter(article => 
        article.headline.toLowerCase().includes(query.toLowerCase()) ||
        article.text.toLowerCase().includes(query.toLowerCase()) ||
        article.source.toLowerCase().includes(query.toLowerCase())
      )

      // Calculate pagination for filtered results
      const total = filteredArticles.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      // Get paginated filtered articles
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

      return {
        articles: paginatedArticles,
        total,
        page,
        limit,
        totalPages
      }
    } catch (error) {
      console.error('Failed to search news articles:', error)
      throw new Error('Failed to search news articles')
    }
  },

  /**
   * Get news article by URL
   * @param url Article URL
   * @returns Single news article or null
   */
  async getArticleByUrl(url: string): Promise<NewsArticle | null> {
    try {
      const response = await this.getNews(1, 1000)
      return response.articles.find(article => article.url === url) || null
    } catch (error) {
      console.error('Failed to fetch article:', error)
      return null
    }
  }
}