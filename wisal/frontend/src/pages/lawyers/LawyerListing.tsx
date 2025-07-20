import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, MapPin, Star, MessageSquare, Video, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pagination } from '@/components/ui/pagination'
import { lawyerService, type LawyerFilter } from '@/services/lawyerService'
import type { User } from '@/types/auth'

const specializations = [
  'Civil Rights',
  'Immigration',
  'Criminal Defense',
  'Police Brutality',
  'Employment Law',
  'Housing Rights',
  'Environmental Justice',
  'LGBTQ+ Rights',
  'Disability Rights',
  'Freedom of Speech',
]

const languages = [
  'English',
  'Spanish',
  'French',
  'Arabic',
  'Chinese',
  'Hindi',
  'Portuguese',
  'Russian',
  'Japanese',
  'German',
]

export default function LawyerListing() {
  const navigate = useNavigate()
  const [lawyers, setLawyers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<LawyerFilter>({
    page: 1,
    limit: 12,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLawyers()
  }, [filters])

  const fetchLawyers = async () => {
    try {
      setLoading(true)
      const response = await lawyerService.getLawyers(filters)
      setLawyers(response.lawyers)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Failed to fetch lawyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching for:', searchTerm)
  }

  const handleFilterChange = (key: keyof LawyerFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 })
    setSearchTerm('')
  }

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Legal Support</h1>
        <p className="text-gray-600">Connect with verified lawyers who understand your cause</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, specialization, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Specialization</label>
                <Select
                  value={filters.specializations?.[0] || ''}
                  onValueChange={(value) => handleFilterChange('specializations', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All specializations</SelectItem>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select
                  value={filters.languages?.[0] || ''}
                  onValueChange={(value) => handleFilterChange('languages', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <Select
                  value={filters.minRating?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('minRating', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rating</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : lawyers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No lawyers found matching your criteria.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {lawyers.map((lawyer) => (
              <Card 
                key={lawyer.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/lawyers/${lawyer.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={lawyer.avatar} alt={lawyer.name} />
                      <AvatarFallback>{lawyer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{lawyer.name}</h3>
                      {lawyer.lawyerProfile && (
                        <>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {lawyer.lawyerProfile.location.city}, {lawyer.lawyerProfile.location.state}
                            </span>
                          </div>
                          {lawyer.lawyerProfile.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{lawyer.lawyerProfile.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">
                                ({lawyer.lawyerProfile.totalConsultations} consultations)
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lawyer.lawyerProfile && (
                    <>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Specializations:</p>
                        <div className="flex flex-wrap gap-1">
                          {lawyer.lawyerProfile.specializations.slice(0, 3).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {lawyer.lawyerProfile.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lawyer.lawyerProfile.specializations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Languages: {lawyer.lawyerProfile.languages.join(', ')}</p>
                        <p className="text-sm text-gray-600">{lawyer.lawyerProfile.yearsOfExperience} years experience</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {lawyer.lawyerProfile.consultationTypes.map((type) => (
                          <div key={type} className="flex items-center gap-1 text-sm text-gray-600">
                            {getConsultationIcon(type)}
                            <span className="capitalize">{type}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  )
}