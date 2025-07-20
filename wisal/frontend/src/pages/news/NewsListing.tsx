import React, { useState, useEffect } from 'react'
import { Search, Newspaper, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NewsCard, NewsCardCompact } from '@/components/news/NewsCard'
import { Pagination } from '@/components/ui/pagination'
import { newsService, type NewsArticle } from '@/services/newsService'

interface NewsListingProps {
  compact?: boolean
  limit?: number
  showSearch?: boolean
  className?: string
}

export default function NewsListing({ 
  compact = false, 
  limit = 12, 
  showSearch = true,
  className 
}: NewsListingProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [currentPage, limit])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = isSearching && searchTerm
        ? await newsService.searchNews(searchTerm, currentPage, limit)
        : await newsService.getNews(currentPage, limit)
      
      setArticles(response.articles)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError('Unable to load news articles. Please try again later.')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim() && !isSearching) return
    
    setIsSearching(!!searchTerm.trim())
    setCurrentPage(1)
    
    try {
      setLoading(true)
      setError(null)
      
      if (searchTerm.trim()) {
        const response = await newsService.searchNews(searchTerm, 1, limit)
        setArticles(response.articles)
        setTotalPages(response.totalPages)
      } else {
        // Clear search
        const response = await newsService.getNews(1, limit)
        setArticles(response.articles)
        setTotalPages(response.totalPages)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const CardComponent = compact ? NewsCardCompact : NewsCard

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Latest News</h2>
        </div>
        
        {showSearch && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              {isSearching && searchTerm ? 'Clear' : 'Search'}
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isSearching 
                ? 'No news articles found matching your search.'
                : 'No news articles available at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Articles Grid */}
          <div className={compact 
            ? "space-y-3 mb-6" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          }>
            {articles.map((article, index) => (
              <CardComponent
                key={`${article.url}-${index}`}
                article={article}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  )
}

// Export a compact version for embedding in other pages
export function NewsSection({ limit = 6 }: { limit?: number }) {
  return (
    <NewsListing 
      compact 
      limit={limit} 
      showSearch={false}
      className="w-full"
    />
  )
}