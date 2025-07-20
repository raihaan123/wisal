import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, User, MapPin, Languages, Star, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { lawyerService } from '@/services/lawyerService';
import { apiClient } from '@/services/apiClient';
import { toast } from '@/components/ui/use-toast';

interface LawyerResult {
  id: string;
  name: string;
  occupation: string;
  specialisms: string[];
  location: string;
  distance?: number;
  languages?: string[];
  rating?: number;
  relevanceScore: number;
  relevanceReason: string;
}

interface SearchState {
  query: string;
  loading: boolean;
  results: LawyerResult[];
  clarificationNeeded: boolean;
  clarificationQuestions: string[];
  clarificationResponses: Record<string, string>;
  error: string | null;
}

export default function AISearchBox() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = !user;
  
  const [state, setState] = useState<SearchState>({
    query: '',
    loading: false,
    results: [],
    clarificationNeeded: false,
    clarificationQuestions: [],
    clarificationResponses: {},
    error: null,
  });
  
  const [showClarificationDialog, setShowClarificationDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!state.query.trim()) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Call AI search endpoint
      const response = await apiClient.post('/api/ai/search', {
        description: state.query,
        clarificationResponses: state.clarificationResponses,
      });
      
      const { 
        clarificationNeeded, 
        clarificationQuestions, 
        matchedLawyers, 
        matchScores,
        relevanceReasons 
      } = response.data;
      
      if (clarificationNeeded && clarificationQuestions.length > 0) {
        setState(prev => ({
          ...prev,
          clarificationNeeded: true,
          clarificationQuestions,
          loading: false,
        }));
        setShowClarificationDialog(true);
      } else {
        // Fetch lawyer details
        const lawyerDetails = await Promise.all(
          matchedLawyers.map(async (lawyerId: string) => {
            try {
              const lawyer = await lawyerService.getLawyerById(lawyerId);
              return {
                id: lawyerId,
                name: lawyer.user.name,
                occupation: lawyer.currentRole,
                specialisms: lawyer.specialisms,
                location: lawyer.location,
                languages: lawyer.languages,
                rating: lawyer.rating,
                relevanceScore: matchScores[lawyerId] || 0,
                relevanceReason: relevanceReasons[lawyerId] || 'Matches your legal needs',
              };
            } catch (error) {
              console.error(`Failed to fetch lawyer ${lawyerId}:`, error);
              return null;
            }
          })
        );
        
        const validResults = lawyerDetails.filter(Boolean) as LawyerResult[];
        
        setState(prev => ({
          ...prev,
          results: validResults,
          loading: false,
          clarificationNeeded: false,
        }));
        setShowResults(true);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to search. Please try again.',
      }));
      toast({
        title: 'Search Error',
        description: 'Failed to process your search. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClarificationResponse = (question: string, response: string) => {
    setState(prev => ({
      ...prev,
      clarificationResponses: {
        ...prev.clarificationResponses,
        [question]: response,
      },
    }));
  };

  const submitClarificationResponses = () => {
    setShowClarificationDialog(false);
    handleSearch(); // Re-run search with clarification responses
  };

  const handleResultClick = (lawyerId: string) => {
    if (isGuest) {
      toast({
        title: 'Sign Up Required',
        description: 'Please sign up or log in to view lawyer profiles and start consultations.',
      });
      navigate('/register');
    } else {
      navigate(`/lawyers/${lawyerId}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Request advice from a legal professional
        </h2>
        <div className="flex gap-4">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Describe the matter you would like assistance with..."
            value={state.query}
            onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-lg py-6"
            disabled={state.loading}
          />
          <Button 
            onClick={handleSearch} 
            disabled={state.loading || !state.query.trim()}
            size="lg"
            className="px-8"
          >
            {state.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
        {state.error && (
          <p className="text-red-500 text-sm mt-2">{state.error}</p>
        )}
      </div>

      {/* Search Results */}
      {showResults && state.results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold mb-4">
            Top {state.results.length} matches for your legal needs:
          </h3>
          
          {state.results.map((lawyer) => (
            <Card 
              key={lawyer.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isGuest ? 'relative overflow-hidden' : ''
              }`}
              onClick={() => handleResultClick(lawyer.id)}
            >
              {isGuest && (
                <div className="absolute inset-0 backdrop-blur-md bg-white/50 z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Sign up to view this lawyer's profile
                    </p>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {isGuest ? 'Legal Professional' : lawyer.name}
                    </CardTitle>
                    <CardDescription>{lawyer.occupation}</CardDescription>
                  </div>
                  {lawyer.relevanceScore && (
                    <Badge variant="secondary" className="text-sm">
                      {Math.round(lawyer.relevanceScore * 100)}% Match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Specialisms */}
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specialisms.map((specialism) => (
                      <Badge key={specialism} variant="outline">
                        {specialism}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Location and Languages */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {lawyer.location}
                      {lawyer.distance && ` (${lawyer.distance} miles away)`}
                    </span>
                    {lawyer.languages && lawyer.languages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Languages className="h-4 w-4" />
                        {lawyer.languages.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  {/* Relevance Reason */}
                  <p className="text-sm text-gray-700 italic">
                    {lawyer.relevanceReason}
                  </p>
                  
                  {/* Rating */}
                  {lawyer.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{lawyer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {isGuest && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-center text-blue-900">
                  We found legal professionals matching your criteria.{' '}
                  <Button 
                    variant="link" 
                    className="text-blue-700 underline p-0 h-auto"
                    onClick={() => navigate('/register')}
                  >
                    Sign up or log in
                  </Button>
                  {' '}to view their profiles and start a consultation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Results */}
      {showResults && state.results.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              No lawyers found matching your criteria. Try broadening your search or{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/lawyers')}
              >
                browse all lawyers
              </Button>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Clarification Dialog */}
      <Dialog open={showClarificationDialog} onOpenChange={setShowClarificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>I need a bit more information</DialogTitle>
            <DialogDescription>
              Please answer these questions to help me find the best lawyer for you:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {state.clarificationQuestions.map((question, index) => (
              <div key={index}>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {question}
                </label>
                <Input
                  placeholder="Your answer..."
                  onChange={(e) => handleClarificationResponse(question, e.target.value)}
                  value={state.clarificationResponses[question] || ''}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowClarificationDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitClarificationResponses}
              disabled={state.clarificationQuestions.some(
                q => !state.clarificationResponses[q]?.trim()
              )}
            >
              Continue Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}