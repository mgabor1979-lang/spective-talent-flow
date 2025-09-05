import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, Users, TrendingUp, Award, Clock, FileText, Shield, Settings } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export const Framework = () => {
  const prince2Principles = [
    {
      title: "Continued Business Justification",
      description: "Every project must remain viable and aligned with business objectives throughout its lifecycle.",
      icon: <Target className="h-6 w-6" />
    },
    {
      title: "Learn from Experience",
      description: "Lessons from previous projects are identified and applied to improve current and future project performance.",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Defined Roles and Responsibilities",
      description: "Clear assignment of accountability and responsibility within the project management structure, covering business, user, and supplier interests.",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Manage by Stages",
      description: "The project is divided into manageable stages to enable effective planning, monitoring, and control.",
      icon: <Award className="h-6 w-6" />
    },
    {
      title: "Manage by Exception",
      description: "Clear tolerances for time, cost, scope, quality, benefits, and risk are established to empower day-to-day decision-making at the appropriate levels without escalating minor issues.",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Focus on Products",
      description: "The project's output—its products—are clearly defined, developed, and validated to meet specified quality requirements.",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "Tailor to Suit the Project Environment",
      description: "The PRINCE2 method is adapted to fit the project's size, complexity, risk profile, and organizational context.",
      icon: <Settings className="h-6 w-6" />
    }
  ];

  const prince2Themes = [
    {
      title: "Business Case",
      description: "Justification for the project in terms of its benefits, costs, and risks."
    },
    {
      title: "Organization",
      description: "Definition of the project governance structure, including roles, responsibilities, and decision-making authorities."
    },
    {
      title: "Quality",
      description: "Establishment of quality criteria, assurance, and control measures to ensure deliverables meet expectations."
    },
    {
      title: "Plans",
      description: "Development of detailed plans defining what will be delivered, when, by whom, and at what cost."
    },
    {
      title: "Risk",
      description: "Systematic identification, assessment, and control of uncertainties that may impact project objectives."
    },
    {
      title: "Change",
      description: "Management of project scope changes and issue resolution to protect the integrity of the project baseline."
    },
    {
      title: "Progress",
      description: "Ongoing measurement of project performance against plans to ensure timely corrective actions."
    }
  ];

  const prince2Processes = [
    {
      title: "Starting Up a Project (SU)",
      description: "Initial project viability assessment and preparation of the project brief."
    },
    {
      title: "Directing a Project (DP)",
      description: "Decision-making and control responsibilities of the Project Board across the project lifecycle."
    },
    {
      title: "Initiating a Project (IP)",
      description: "Development of the Project Initiation Documentation (PID), which serves as the project's foundation."
    },
    {
      title: "Controlling a Stage (CS)",
      description: "Management of day-to-day project activities and monitoring of work progress within a stage."
    },
    {
      title: "Managing Product Delivery (MP)",
      description: "Control of work package acceptance, execution, and delivery by the team."
    },
    {
      title: "Managing a Stage Boundary (SB)",
      description: "Planning for the next stage and evaluating the current stage's performance."
    },
    {
      title: "Closing a Project (CP)",
      description: "Formal closure of the project, confirmation of objectives met, and lessons learned documentation."
    }
  ];

  const frameworkElements = [
    {
      title: "Project Documentation Templates",
      description: "A comprehensive set of standardized forms and templates covering all critical project phases, from initiation and planning to execution and closure. These ensure clarity in scope definition, risk management, stakeholder communication, and progress tracking.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Centralized Document Management",
      description: "All project documentation is securely stored and managed within a Microsoft Teams environment, providing real-time access and version control for all stakeholders. This enables seamless collaboration, auditability, and traceability throughout the project lifecycle.",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Task and Activity Management",
      description: "Project tasks, responsibilities, and deadlines are organized and monitored using Microsoft Planner or Microsoft Project for the Web. This ensures clear task ownership, timely execution, and alignment with project milestones and deliverables.",
      icon: <Settings className="h-6 w-6" />
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-spective-dark to-spective-gray text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Project Framework</h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            At Spective, we provide our consultants with a structured and standardized project 
            management framework designed to ensure consistency, efficiency, and transparency across 
            all client engagements. This framework integrates proven methodologies, digital tools, 
            and best practices to support the successful execution of complex industrial projects.
          </p>
        </div>
      </section>

      {/* PRINCE2 Introduction */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">PRINCE2 Methodology</h2>
            <p className="text-lg text-muted-foreground">
              At Spective, we apply the PRINCE2 methodology as the foundation for our project 
              management approach. PRINCE2 is a globally recognized, process-driven framework 
              designed to ensure that projects are well-structured, controlled, and aligned with 
              business objectives. Its structured design provides clarity in governance, 
              decision-making, and accountability across all project phases.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCE2 Principles */}
      <section className="py-20 bg-spective-light">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">1. PRINCE2 Principles</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            The seven core principles form the foundation of every PRINCE2 project. These universally 
            applicable principles guide all decision-making and project behavior:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prince2Principles.map((principle, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
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
          <h2 className="text-3xl font-bold text-center mb-6">2. PRINCE2 Themes</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            These seven themes describe critical aspects of project management that must be continually 
            addressed throughout the project lifecycle:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prince2Themes.map((theme, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
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
          <h2 className="text-3xl font-bold text-center mb-6">3. PRINCE2 Processes</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            The methodology is executed through seven defined processes that guide the project from 
            initiation to closure:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prince2Processes.map((process, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
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
            <h2 className="text-3xl font-bold text-center mb-6">4. Tailoring PRINCE2 to Our Environment</h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              At Spective, we tailor PRINCE2 principles, themes, and processes to suit the unique 
              requirements of each client and project—considering factors such as organizational culture, 
              project complexity, scale, and risk exposure. This ensures that the methodology remains 
              practical, scalable, and effective in automotive and manufacturing environments.
            </p>
            
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-8 text-center">Key elements of our framework include:</h3>
              <div className="grid md:grid-cols-1 gap-8">
                {frameworkElements.map((element, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
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
          </div>
        </div>
      </section>
    </Layout>
  );
};