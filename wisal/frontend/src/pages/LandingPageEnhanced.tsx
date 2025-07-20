import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, MessageSquare, Lock, Globe, Heart, ArrowRight } from 'lucide-react'
import AISearchBoxEnhanced from '@/components/search/AISearchBoxEnhanced'
import { OliveBranch } from '@/components/decorations/OliveBranch'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useParallax } from '@/hooks/useParallax'
import { cn } from '@/lib/utils'

export default function LandingPageEnhanced() {
  const navigate = useNavigate()
  const heroParallax = useParallax(0.5)
  const branchParallax = useParallax(0.3)
  
  // Intersection observers for scroll animations
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [howItWorksRef, howItWorksVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.3 })

  const features = [
    {
      icon: Shield,
      title: 'Legal Protection',
      description: 'Connect with verified lawyers who specialize in activist rights and civil liberties.',
      delay: 0,
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your identity and conversations are protected with end-to-end encryption.',
      delay: 100,
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a network of activists and lawyers committed to social justice.',
      delay: 200,
    },
    {
      icon: MessageSquare,
      title: 'Instant Consultation',
      description: 'Get legal advice through secure chat, video calls, or phone consultations.',
      delay: 300,
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access legal support from anywhere, with lawyers from multiple jurisdictions.',
      delay: 400,
    },
    {
      icon: Heart,
      title: 'Pro Bono Services',
      description: 'All services are provided free of charge to support your activism.',
      delay: 500,
    },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Floating Olive Branches */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <OliveBranch 
          className="absolute w-32 h-48 opacity-10 animate-float"
          style={{ 
            top: '10%', 
            left: '5%',
            transform: `translateY(${branchParallax}px)`,
            animationDelay: '0s'
          }}
        />
        <OliveBranch 
          className="absolute w-24 h-36 opacity-10 animate-float"
          style={{ 
            top: '60%', 
            right: '8%',
            transform: `translateY(${branchParallax}px) rotate(45deg)`,
            animationDelay: '1.5s'
          }}
        />
        <OliveBranch 
          className="absolute w-28 h-42 opacity-5 animate-float"
          style={{ 
            bottom: '20%', 
            left: '10%',
            transform: `translateY(${branchParallax}px) rotate(-30deg)`,
            animationDelay: '3s'
          }}
        />
      </div>

      {/* Hero Section with Animated Gradient */}
      <section className="relative min-h-[80vh] flex items-center">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-wisal-moss/20 via-wisal-forest/10 to-wisal-dark-moss/15 animate-gradient"
          style={{
            backgroundSize: '400% 400%',
            transform: `translateY(${heroParallax}px)`,
          }}
        />
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-wisal-dark-moss mb-6 font-bierstadt animate-fade-in-down">
              Legal Support for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-wisal-forest to-wisal-moss animate-gradient">
                Activists
              </span>
            </h1>
            <p className="text-xl text-wisal-dark-moss/80 mb-8 font-bierstadt animate-fade-in-up animation-delay-200">
              Wisal connects activists with pro bono lawyers who understand your cause 
              and are ready to defend your rights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animation-delay-400">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-wisal-forest hover:bg-wisal-dark-moss transition-all hover:scale-105 hover:shadow-lg"
              >
                Get Legal Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/activism-hub')}
                className="border-wisal-moss hover:bg-wisal-moss/10 transition-all hover:scale-105"
              >
                Browse Resources
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-24"
          >
            <path 
              d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* AI Search Section with Glow Effect */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-wisal-moss/20 to-wisal-forest/20 blur-3xl opacity-30 animate-glow" />
            <div className="relative animate-fade-in">
              <AISearchBoxEnhanced />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Staggered Animations */}
      <section className="py-20 bg-gradient-to-b from-white to-wisal-moss/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={featuresRef}>
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-3xl md:text-4xl font-bold text-wisal-dark-moss mb-4 font-bierstadt transition-all duration-1000",
              featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              Why Choose Wisal?
            </h2>
            <p className={cn(
              "text-lg text-wisal-dark-moss/80 max-w-2xl mx-auto font-bierstadt transition-all duration-1000 delay-200",
              featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              We provide a secure platform that bridges the gap between activists 
              and legal professionals who share your values.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={cn(
                  "group wisal-card hover:shadow-xl transition-all duration-500 border-wisal-moss/20 hover:-translate-y-2",
                  featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                )}
                style={{
                  transitionDelay: featuresVisible ? `${feature.delay}ms` : '0ms'
                }}
              >
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-wisal-forest mb-4 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle className="text-wisal-dark-moss font-bierstadt">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-wisal-dark-moss/70">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section with Timeline Animation */}
      <section className="py-20 bg-white" ref={howItWorksRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-3xl md:text-4xl font-bold text-wisal-dark-moss mb-4 font-bierstadt transition-all duration-1000",
              howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-wisal-moss/20 via-wisal-forest/40 to-wisal-moss/20" />
            
            {[
              { step: 1, title: 'Sign Up', description: 'Create a secure account as an activist or lawyer. Your privacy is our priority.' },
              { step: 2, title: 'Connect', description: 'Find lawyers who specialize in your area of activism or describe your legal needs.' },
              { step: 3, title: 'Get Support', description: 'Receive free legal consultation through secure communication channels.' },
            ].map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "text-center relative transition-all duration-700",
                  howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                )}
                style={{
                  transitionDelay: howItWorksVisible ? `${index * 200}ms` : '0ms'
                }}
              >
                <div className="bg-gradient-to-br from-wisal-forest to-wisal-moss text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative z-10 transition-transform duration-300 hover:scale-110">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-wisal-dark-moss font-bierstadt">{item.title}</h3>
                <p className="text-wisal-dark-moss/70">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section 
        className="relative py-20 overflow-hidden" 
        ref={ctaRef}
      >
        {/* Animated background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-wisal-forest via-wisal-moss to-wisal-dark-moss animate-gradient"
          style={{
            backgroundSize: '400% 400%',
            transform: `translateY(${heroParallax * 0.3}px)`,
          }}
        />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold text-white mb-4 font-bierstadt transition-all duration-1000",
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            Ready to Protect Your Rights?
          </h2>
          <p className={cn(
            "text-xl text-white/90 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-200",
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            Join thousands of activists who have found legal support through Wisal.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate('/register')}
            className={cn(
              "bg-white text-wisal-forest hover:bg-wisal-moss/10 transition-all hover:scale-105 hover:shadow-xl",
              ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
            style={{
              transitionDelay: ctaVisible ? '400ms' : '0ms'
            }}
          >
            Join Wisal Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}