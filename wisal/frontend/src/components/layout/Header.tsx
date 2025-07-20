import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { Menu, X, Mail } from 'lucide-react'
import { useState } from 'react'
import CommandPalette from '@/components/CommandPalette'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'activist':
        return '/dashboard/activist'
      case 'lawyer':
        return '/dashboard/lawyer'
      case 'admin':
        return '/dashboard/admin'
      default:
        return '/'
    }
  }

  return (
    <header>
      {/* Wisal Brand Banner */}
      <div className="wisal-banner bg-wisal-dark-moss">
        <div className="wisal-banner-content">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Wisal" 
              className="wisal-logo h-12 w-auto"
              onError={(e) => {
                // Fallback to text if logo image is not available
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-3xl font-bold text-white font-bierstadt">Wisal</span>
          </Link>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  to="/activism-hub"
                  className="text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-sm font-medium transition-colors wisal-focus"
                >
                  Activism Hub
                </Link>
                <Link
                  to="/lawyers"
                  className="text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-sm font-medium transition-colors wisal-focus"
                >
                  Find Lawyers
                </Link>
                <Link
                  to="/forum"
                  className="text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-sm font-medium transition-colors wisal-focus"
                >
                  Community Forum
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <CommandPalette />
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/consultations')}
                    title="Messages"
                  >
                    <Mail className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(getDashboardPath())}
                  >
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <Link
              to="/activism-hub"
              className="block text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-base font-medium transition-colors wisal-focus"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Activism Hub
            </Link>
            <Link
              to="/lawyers"
              className="block text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-base font-medium transition-colors wisal-focus"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Lawyers
            </Link>
            <Link
              to="/forum"
              className="block text-wisal-dark-moss hover:text-wisal-forest px-3 py-2 rounded-md text-base font-medium transition-colors wisal-focus"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community Forum
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/consultations')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(getDashboardPath())
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/login')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/register')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}