import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Award, Users, Briefcase, Globe, Lightbulb, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useHomepageServices } from '@/hooks/use-homepage-services';
import { usePortfolioItems } from '@/hooks/use-portfolio-items';
import { ContactModal } from '@/components/ContactModal';
import { PortfolioDetailModal } from '@/components/PortfolioDetailModal';

export const Homepage = () => {
  const { services, loading: servicesLoading } = useHomepageServices();
  const { items: portfolioItems, loading: portfolioLoading } = usePortfolioItems();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<{ title: string; description: string } | null>(null);

  // Helper function to strip HTML tags and get plain text excerpt
  const getTextExcerpt = (html: string, maxLength: number = 2000): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Add spacing after block elements before converting to text
    const blockElements = tmp.querySelectorAll('p, div, br, h1, h2, h3, h4, h5, h6, li');
    for (const el of blockElements) {
      if (el.textContent) {
        el.textContent = el.textContent + ' ';
      }
    }
    
    let text = tmp.textContent || tmp.innerText || '';
    // Replace multiple spaces/newlines with single space and trim
    while (text.includes('  ') || text.includes('\n') || text.includes('\r')) {
      text = text.replace('  ', ' ').replace('\n', ' ').replace('\r', ' ');
    }
    text = text.trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Available icons mapping
  const iconMap = {
    Target,
    Award,
    Users,
    Briefcase,
    Globe,
    Lightbulb,
    TrendingUp
  };

  // Function to get icon component from string
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Target;
    return <IconComponent className="h-8 w-8" />;
  };

  const partners = [
    { name: "Magna", logo: "/images/logo1.png" },
    { name: "Woco", logo: "/images/logo2.png" },
    { name: "Yanfeng", logo: "/images/logo3.jpg" },
    { name: "FEINTOOL", logo: "/images/logo4.png" },
    { name: "Autoneum", logo: "/images/logo5.png" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-gradient-to-br from-spective-dark to-spective-gray text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rotate-45"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gray-300 rotate-12"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-gray-400 -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rotate-45"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-200 rotate-12"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">SPECTIVE</h1>
          <p className="text-xl md:text-2xl text-gray-300 italic">
            We deliver projects — on time, on budget, audit-ready.
          </p>
        </div>
      </section>

      {/* Section 1 - Introduction */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Spective is a project consulting company helping organizations execute complex projects with structure, transparency, and measurable results.
              </p>
              <div className="flex flex-col gap-1 md:flex-row">
                <Button asChild size="lg" variant="outline" className="mr-4">
                  <a href="#portfolio">
                    See our project portfolio
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="bg-spective-accent hover:bg-spective-accent/90"
                  onClick={() => setContactModalOpen(true)}
                >
                  Let's discuss your next project <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

            </div>
            <div className="flex justify-center">
              <img
                src="/images/team.jpeg"
                alt="Professional team"
                className="rounded-lg w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Our Services */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Project management</h2>
          {servicesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <Card key={`loading-${item}`} className="h-full">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-8 w-8 bg-muted rounded"></div>
                      <div className="h-6 bg-muted rounded"></div>
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-spective-accent mb-4">{getIconComponent(service.icon)}</div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3 - About Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">About Spective</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/us.jpeg"
                alt="About Spective"
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Spective is a project management consulting company specializing in industrial and manufacturing projects.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We connect clients with highly skilled professionals and provide a structured project management framework that ensures transparency, control, and professional oversight throughout the entire project lifecycle.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our approach guarantees that every project is executed efficiently, on time, and in compliance with all quality and budget expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Project Portfolio */}
      <section className="py-20 bg-background" id="portfolio">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">Our Project Portfolio</h2>
          {portfolioLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <Card key={`loading-${item}`} className="h-full">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-muted rounded"></div>
                      <div className="h-20 bg-muted rounded"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="h-full hover:shadow-lg transition-shadow flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex-1 mb-4 relative overflow-hidden">
                      <div 
                        className="overflow-hidden"
                        style={{ 
                          maxHeight: '13.5rem', // ~9 lines at 1.5rem line-height
                        }}
                      >
                        <h3 className="text-xl font-semibold text-spective-dark mb-3">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-muted-foreground">
                            {getTextExcerpt(item.description)}
                          </p>
                        )}
                      </div>
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                        style={{
                          background: 'linear-gradient(to bottom, transparent, hsl(var(--card)) 70%)'
                        }}
                      ></div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-spective-accent text-spective-accent hover:bg-spective-accent hover:text-white"
                      onClick={() => setSelectedPortfolio({ title: item.title, description: item.description })}
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-spective-accent hover:bg-spective-accent/90"
              onClick={() => setContactModalOpen(true)}
            >
              Facing similar challenges? Let's talk.
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5 - Partners */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Trusted Partners</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
            We are proud to support leading companies in the automotive and manufacturing industries.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
            {partners.map((partner) => (
              <div key={partner.name} className="w-32 h-16 rounded flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 - Contact CTA */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Us Today</h2>
              <p className="text-lg text-muted-foreground">
                Ready to transform your organization? Get in touch with our team to discuss how our project management expertise can help you achieve your goals.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Button
                size="lg"
                className="bg-spective-accent hover:bg-spective-accent/90"
                onClick={() => setContactModalOpen(true)}
              >
                Let’s discuss your next project
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 - Professionals CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Professionals are Waiting for You</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our network of experienced project managers and industry experts ready to drive your next transformation project.
          </p>
          <Button asChild size="lg" className="bg-spective-accent hover:bg-spective-accent/90">
            <Link to="/professionals">
              Browse Professionals <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      

      {/* Section 11 - Join Us */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Join us and find professional challenges!</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Are you an experienced professional looking for your next challenge? Join our network of interim managers and consultants to work on exciting transformation projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/signup">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">
                Already have an account? Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Portfolio Detail Modal */}
      {selectedPortfolio && (
        <PortfolioDetailModal
          isOpen={!!selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
          title={selectedPortfolio.title}
          description={selectedPortfolio.description}
        />
      )}
    </Layout>
  );
};