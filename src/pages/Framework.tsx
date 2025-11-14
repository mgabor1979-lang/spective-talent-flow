import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, Users, TrendingUp, Award, Clock, FileText, Shield, Settings, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ContactModal } from '@/components/ContactModal';
import { useState } from 'react';

export const Framework = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const corePrinciples = [
    {
      title: "Business Justification",
      description: "Every project must have a clear purpose, remain viable, and deliver measurable value throughout its lifecycle",
      icon: <Target className="h-6 w-6" />
    },
    {
      title: "Defined Roles and Responsibilities",
      description: "Each project has clearly assigned accountabilities covering business, user, and supplier perspectives",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Stage-Based Management",
      description: "Projects are divided into manageable phases to enable effective planning, monitoring, and control.",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Manage by exception",
      description: "Clear tolerances for time, cost, scope, quality, benefits, and risk are established to empower day-to-day decision-making at the appropriate levels without escalating minor issues.",
      icon: <Award className="h-6 w-6" />
    },
    {
      title: "Product and Deliverable Focus",
      description: "Project outputs are clearly defined, developed, and validated against agreed quality requirements.",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  const keyManagementAreas = [
    {
      title: "Business Case & Objectives",
      description: "Establishing clear project goals, benefits, and expected outcomes."
    },
    {
      title: "Organization",
      description: "Defining decision-making structures, roles, and responsibilities."
    },
    {
      title: "Quality & Performance",
      description: "Setting and monitoring quality standards to ensure all deliverables meet expectations."
    },
    {
      title: "Planning & Scheduling",
      description: "Developing detailed, realistic plans that define what will be delivered, when, and by whom."
    },
    {
      title: "Risk & Issue Management",
      description: "Identifying, assessing, and mitigating risks and issues that could affect project success."
    },
    {
      title: "Change Management",
      description: "Managing scope changes and ensuring alignment between stakeholders."
    },
    {
      title: "Progress Tracking & Reporting",
      description: "Regularly monitoring performance against plans to ensure transparency and timely corrective actions."
    }
  ];

  const projectLifecycles = [
    {
      title: "Project Initiation",
      description: "Defining objectives, scope, stakeholders, and feasibility."
    },
    {
      title: "Planning",
      description: "Creating detailed plans, schedules, and risk assessments."
    },
    {
      title: "Execution & Monitoring",
      description: "Coordinating activities, tracking progress, and managing risks."
    },
    {
      title: "Stage Review & Adjustment",
      description: "Evaluating progress and updating plans as needed."
    },
    {
      title: "Project Closure",
      description: "Confirming objectives achieved, documenting results, and capturing lessons learned."
    }
  ];

  const practicalToolsAndInfrastructure = [
    {
      title: "Project Documentation Templates",
      description: "A comprehensive set of standardized templates covering all critical project phases — from initiation and planning to execution and closure. These templates ensure consistency in scope definition, risk management, communication, and reporting.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Centralized Document Management",
      description: "All project documentation is securely stored within Microsoft Teams, ensuring real-time access, version control, and traceability for all stakeholders.",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Task and Activity Management",
      description: "We use Microsoft Planner or Microsoft Project for the Web to organize and monitor project tasks, responsibilities, and deadlines, ensuring clear ownership and timely delivery.",
      icon: <Settings className="h-6 w-6" />
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-spective-dark to-spective-gray text-primary-foreground py-10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Framework</h1>
        </div>
      </section>      {/* PRINCE2 Introduction */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">How We Ensure Project Success</h2>
            <p className="max-w-4xl mx-auto mb-3">
              Spective provides end-to-end project management and operational consulting for its clients.
            </p>
            <p className="max-w-4xl mx-auto mb-3">
              Our consultants combine hands-on industry experience with structured project management expertise to ensure stable launches, compliant systems, and measurable performance.
            </p>
            <p className="max-w-4xl mx-auto mb-3">
              What makes Spective unique is that we don’t just provide experts — we provide a project management framework that supports both the consultant and the client throughout the entire engagement.
            </p>
            <p className="max-w-4xl mx-auto mb-3">
              This framework ensures that every project is executed with clear structure, transparent communication, and professional oversight.
            </p>
            <p className="max-w-4xl mx-auto mb-8">
              It enables consistent reporting, risk management, and alignment between all stakeholders — creating full visibility for the client and confidence in project outcomes
            </p>
            <Button
              size="lg"
              className="bg-spective-accent hover:bg-spective-accent/90"
              onClick={() => setContactModalOpen(true)}
            >
              Let's discuss how we can apply this to your project <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* PRINCE2 Principles */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">1. Core Principles</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Our framework is guided by key principles that ensure professional execution and consistent results across all projects:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {corePrinciples.map((principle, index) => (
              <Card key={'_' + index} className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-spective-accent mb-4">{principle.icon}</div>
                  <h3 className="text-lg font-semibold mb-3">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCE2 Themes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">2. Key Management Areas</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            The Spective framework addresses all critical aspects of project management that must be monitored throughout the project lifecycle:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyManagementAreas.map((theme, index) => (
              <Card key={'_' + index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{theme.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCE2 Processes */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">3. Our Project Lifecycle Approach</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Our framework follows a structured lifecycle that ensures projects are consistently managed from initiation to closure:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectLifecycles.map((process, index) => (
              <Card key={'_' + index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{process.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{process.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tailoring Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">4. Practical Tools and Infrastructure</h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              We support every project with standardized tools and processes that promote efficiency and transparency:
            </p>

            <div className="mb-12">
              <div className="grid md:grid-cols-1 gap-8">
                {practicalToolsAndInfrastructure.map((element, index) => (
                  <Card key={'_' + index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4">
                        <div className="text-spective-accent mt-1">{element.icon}</div>
                        <div>
                          <h4 className="text-xl font-semibold mb-3">{element.title}</h4>
                          <p className="text-muted-foreground leading-relaxed">{element.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="text-center w-full">
              <Button
                size="lg"
                className="bg-spective-accent hover:bg-spective-accent/90"
                onClick={() => setContactModalOpen(true)}
              >
                Let's discuss how we can apply this to your project <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
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