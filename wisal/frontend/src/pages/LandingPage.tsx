import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, MessageSquare, Lock, Globe, Heart } from 'lucide-react'
import AISearchBox from '@/components/search/AISearchBox'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Shield,
      title: 'Legal Protection',
      description: 'Connect with verified lawyers who specialize in activist rights and civil liberties.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your identity and conversations are protected with end-to-end encryption.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a network of activists and lawyers committed to social justice.',
    },
    {
      icon: MessageSquare,
      title: 'Instant Consultation',
      description: 'Get legal advice through secure chat, video calls, or phone consultations.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access legal support from anywhere, with lawyers from multiple jurisdictions.',
    },
    {
      icon: Heart,
      title: 'Pro Bono Services',
      description: 'All services are provided free of charge to support your activism.',
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-wisal-moss/10 to-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-wisal-dark-moss mb-6 font-bierstadt">
              Legal Support for <span className="text-wisal-forest">Activists</span>
            </h1>
            <p className="text-xl text-wisal-dark-moss/80 mb-8 font-bierstadt">
              Wisal connects activists with pro bono lawyers who understand your cause 
              and are ready to defend your rights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Get Legal Help
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/activism-hub')}
              >
                Browse Resources
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Search Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AISearchBox />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-wisal-moss/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-wisal-dark-moss mb-4 font-bierstadt">
              Why Choose Wisal?
            </h2>
            <p className="text-lg text-wisal-dark-moss/80 max-w-2xl mx-auto font-bierstadt">
              We provide a secure platform that bridges the gap between activists 
              and legal professionals who share your values.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="wisal-card hover:shadow-lg transition-all hover:scale-105 border-wisal-moss/20">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-wisal-forest mb-4" />
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

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create a secure account as an activist or lawyer. 
                Your privacy is our priority.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Find lawyers who specialize in your area of activism 
                or describe your legal needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Support</h3>
              <p className="text-gray-600">
                Receive free legal consultation through secure 
                communication channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Protect Your Rights?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of activists who have found legal support through Wisal.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate('/register')}
          >
            Join Wisal Today
          </Button>
        </div>
      </section>
    </div>
  )
}