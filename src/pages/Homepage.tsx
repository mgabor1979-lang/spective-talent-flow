import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Award, Users, Briefcase, Globe, Lightbulb, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useHomepageServices } from '@/hooks/use-homepage-services';
import { usePortfolioItems } from '@/hooks/use-portfolio-items';
import { ContactModal } from '@/components/ContactModal';

export const Homepage = () => {
  const { services, loading: servicesLoading } = useHomepageServices();
  const { items: portfolioItems, loading: portfolioLoading } = usePortfolioItems();
  const [contactModalOpen, setContactModalOpen] = useState(false);

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
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
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
          <h2 className="text-3xl font-bold mb-12">About Us</h2>
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
                Spective was founded in 2021 with the aim of providing specialized project management consulting services to the automotive and manufacturing industries. Since our inception, we have achieved steady and sustainable growth, supported by the successful delivery of complex and high-value projects for our clients.
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
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={`loading-${item}`} className="p-4 border-l-4 border-spective-accent bg-muted rounded-r-lg animate-pulse">
                  <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioItems.map((item) => (
                <div key={item.id} className="p-4 border-l-4 border-spective-accent bg-muted rounded-r-lg">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  {item.description && <p className="text-muted-foreground">{item.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5 - Partners */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Trusted Partners</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
            We are proud to support leading companies in the automotive and manufacturing industries by providing project management expertise that drives operational excellence, ensures project success, and contributes to long-term business sustainability.
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
                Ready to transform your organization? Get in touch with our team to discuss how our interim management solutions can help you achieve your goals.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Button 
                size="lg" 
                className="bg-spective-accent hover:bg-spective-accent/90"
                onClick={() => setContactModalOpen(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 - Our Motto */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">Our Motto</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                <strong>"We give a different perspective"</strong>, reflects our commitment to offering unique insights and strategies. We understand that every business is unique, facing distinct challenges and opportunities. That's why we tailor our guidance and support to your specific needs, helping you make informed decisions and achieve sustainable growth.
              </p>
              <p className="text-lg text-muted-foreground">
                Contact us today and experience the transformative power of our expertise.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/success.jpeg"
                alt="Our vision"
                className="rounded-lg w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 - Professionals CTA */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Professionals are Waiting for You</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our network of experienced interim managers, consultants, and industry experts ready to drive your next transformation project.
          </p>
          <Button asChild size="lg" className="bg-spective-accent hover:bg-spective-accent/90">
            <Link to="/professionals">
              Browse Professionals <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Section 9 - Partner with Spective */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Partner with Spective</h2>
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <p className="text-lg text-muted-foreground mb-6">
                and experience the transformative power of our expertise. Let us connect you with professionals who possess the knowledge and skills to drive your success.
              </p>
              <p className="text-lg text-muted-foreground">
                Together, we will navigate challenges, optimize operations, and provide a fresh perspective to help you thrive in the ever-changing business landscape.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/partnership.jpeg"
                alt="Partnership"
                className="rounded-lg w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 10 - Final CTA */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-lg text-muted-foreground">
                Take the first step towards achieving extraordinary results. Our team is ready to discuss how we can support your transformation journey.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Button 
                size="lg" 
                className="bg-spective-accent hover:bg-spective-accent/90"
                onClick={() => setContactModalOpen(true)}
              >
                Contact Us
              </Button>
            </div>
          </div>
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
    </Layout>
  );
};