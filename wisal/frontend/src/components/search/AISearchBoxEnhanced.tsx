import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, User, MapPin, Languages, Star, Lock, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { lawyerService } from '@/services/lawyerService';
import { apiClient } from '@/services/apiClient';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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

export default function AISearchBoxEnhanced() {
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
  const [isFocused, setIsFocused] = useState(false);
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
      {/* Search Input with Glow Effect */}
      <div className="relative">
        <div className="text-center mb-6 animate-fade-in-down">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-wisal-dark-moss font-bierstadt">
            AI-Powered Legal Matching
          </h2>
          <p className="text-wisal-dark-moss/70 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-wisal-forest" />
            Describe your legal needs and find the perfect lawyer
          </p>
        </div>
        
        <div className={cn(
          "relative transition-all duration-300",
          isFocused && "drop-shadow-[0_0_35px_rgba(138,157,72,0.3)]"
        )}>
          {/* Animated glow background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-wisal-moss/20 to-wisal-forest/20 blur-xl opacity-0 transition-opacity duration-500",
            isFocused && "opacity-60 animate-glow"
          )} />
          
          <div className="relative flex gap-4">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="e.g., 'I need help with protest rights' or 'environmental activism legal support'..."
              value={state.query}
              onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "flex-1 text-lg py-6 border-wisal-moss/30 transition-all duration-300",
                "hover:border-wisal-moss/50 focus:border-wisal-forest",
                isFocused && "shadow-lg"
              )}
              disabled={state.loading}
            />
            <Button 
              onClick={handleSearch} 
              disabled={state.loading || !state.query.trim()}
              size="lg"
              className="px-8 bg-wisal-forest hover:bg-wisal-dark-moss transition-all hover:scale-105 hover:shadow-lg"
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
        </div>
        
        {state.error && (
          <p className="text-red-500 text-sm mt-2 animate-fade-in">{state.error}</p>
        )}
      </div>

      {/* Search Results with Enhanced Animations */}
      {showResults && state.results.length > 0 && (
        <div className="mt-8 space-y-4 animate-fade-in-up">
          <h3 className="text-xl font-semibold mb-4 text-wisal-dark-moss font-bierstadt">
            Top {state.results.length} matches for your legal needs:
          </h3>
          
          {state.results.map((lawyer, index) => (
            <Card 
              key={lawyer.id} 
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                "border-wisal-moss/20 hover:border-wisal-moss/40",
                isGuest && "relative overflow-hidden",
                "animate-fade-in-up"
              )}
              style={{
                animationDelay: `${index * 100}ms`
              }}
              onClick={() => handleResultClick(lawyer.id)}
            >
              {isGuest && (
                <div className="absolute inset-0 backdrop-blur-md bg-white/50 z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-wisal-forest" />
                    <p className="text-sm font-medium text-wisal-dark-moss">
                      Sign up to view this lawyer's profile
                    </p>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-wisal-dark-moss">
                      <User className="h-5 w-5" />
                      {isGuest ? 'Legal Professional' : lawyer.name}
                    </CardTitle>
                    <CardDescription>{lawyer.occupation}</CardDescription>
                  </div>
                  {lawyer.relevanceScore && (
                    <Badge 
                      variant="secondary" 
                      className="text-sm bg-wisal-moss/20 text-wisal-dark-moss border-wisal-moss/30"
                    >
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
                      <Badge 
                        key={specialism} 
                        variant="outline"
                        className="border-wisal-moss/30 text-wisal-dark-moss"
                      >
                        {specialism}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Location and Languages */}
                  <div className="flex items-center gap-4 text-sm text-wisal-dark-moss/70">
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
                  <p className="text-sm text-wisal-dark-moss/70 italic">
                    {lawyer.relevanceReason}
                  </p>
                  
                  {/* Rating */}
                  {lawyer.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-wisal-moss text-wisal-moss" />
                      <span className="text-sm font-medium">{lawyer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {isGuest && (
            <Card className="bg-wisal-moss/10 border-wisal-moss/30 animate-fade-in">
              <CardContent className="pt-6">
                <p className="text-center text-wisal-dark-moss">
                  We found legal professionals matching your criteria.{' '}
                  <Button 
                    variant="link" 
                    className="text-wisal-forest hover:text-wisal-dark-moss underline p-0 h-auto"
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
        <Card className="mt-8 border-wisal-moss/20 animate-fade-in">
          <CardContent className="pt-6">
            <p className="text-center text-wisal-dark-moss/70">
              No lawyers found matching your criteria. Try broadening your search or{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-wisal-forest hover:text-wisal-dark-moss"
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
            <DialogTitle className="text-wisal-dark-moss">I need a bit more information</DialogTitle>
            <DialogDescription>
              Please answer these questions to help me find the best lawyer for you:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {state.clarificationQuestions.map((question, index) => (
              <div key={index}>
                <label className="text-sm font-medium text-wisal-dark-moss block mb-2">
                  {question}
                </label>
                <Input
                  placeholder="Your answer..."
                  onChange={(e) => handleClarificationResponse(question, e.target.value)}
                  value={state.clarificationResponses[question] || ''}
                  className="border-wisal-moss/30 focus:border-wisal-forest"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowClarificationDialog(false)}
              className="border-wisal-moss/30 text-wisal-dark-moss hover:bg-wisal-moss/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitClarificationResponses}
              disabled={state.clarificationQuestions.some(
                q => !state.clarificationResponses[q]?.trim()
              )}
              className="bg-wisal-forest hover:bg-wisal-dark-moss"
            >
              Continue Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}