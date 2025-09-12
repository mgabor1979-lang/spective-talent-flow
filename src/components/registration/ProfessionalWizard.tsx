import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { X, Plus, Trash2 } from "lucide-react";
import { EducationStep } from "./EducationStep";
import { useTermsConditions } from "@/hooks/use-terms-conditions";

// Step 1: Daily Wage
const wageSchema = z.object({
  dailyWageNet: z.number().min(1, "Daily wage must be greater than 0"),
});

// Work Experience Schema
const workExperienceItemSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company name is required"),
  startMonth: z.string().min(1, "Start month is required"),
  startYear: z.string().min(1, "Start year is required"),
  endMonth: z.string().optional(),
  endYear: z.string().optional(),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
  isCurrentJob: z.boolean().default(false),
});

// Step 2: Work Experience
const experienceSchema = z.object({
  workExperienceSummary: z.string().min(50, "Please provide a detailed experience summary (at least 50 characters)"),
  workExperiences: z.array(workExperienceItemSchema).min(1, "Please add at least one work experience"),
});

// Step 3: Skills and Technologies
const skillsSchema = z.object({
  skills: z.array(z.object({
    skill: z.string().min(1, "Skill is required"),
    level: z.enum(["junior", "medior", "senior", "expert"]),
  })).min(1, "Please add at least one skill"),
  languages: z.array(z.object({
    language: z.string().min(1, "Language is required"),
    level: z.enum(["beginner", "intermediate", "advanced", "native"]),
  })).min(1, "Please add at least one language"),
  technologies: z.array(z.string()).min(1, "Please add at least one technology"),
});

// Step 4: Education
const educationSchema = z.object({
  educations: z.array(z.object({
    school: z.string().min(1, 'School is required'),
    degree: z.string().min(1, 'Degree is required'),
    startYear: z.string().min(1, 'Start year is required'),
    endYear: z.string().optional(),
    isCurrent: z.boolean(),
  })).min(1, 'At least one education is required'),
}).refine((data) => {
  // Custom validation: End year should be greater than start year
  return data.educations.every(edu => {
    if (!edu.endYear || edu.isCurrent) return true;
    return parseInt(edu.endYear) > parseInt(edu.startYear);
  });
}, {
  message: "End year must be greater than start year",
  path: ["educations"],
});

// Step 5: Terms
const termsSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
});

type WageFormData = z.infer<typeof wageSchema>;
type ExperienceFormData = z.infer<typeof experienceSchema>;
type SkillsFormData = z.infer<typeof skillsSchema>;
type EducationFormData = z.infer<typeof educationSchema>;
type TermsFormData = z.infer<typeof termsSchema>;

export type ProfessionalWizardData = WageFormData & {
  workExperienceSummary: string;
  workExperiences: ExperienceFormData['workExperiences'];
} & SkillsFormData & EducationFormData & TermsFormData;

// Available languages
const AVAILABLE_LANGUAGES = [
  "English", "German", "French", "Spanish", "Italian", "Hungarian", 
  "Portuguese", "Dutch", "Polish", "Czech", "Romanian", "Bulgarian",
  "Croatian", "Slovak", "Slovenian", "Estonian", "Latvian", "Lithuanian"
];

interface ProfessionalWizardProps {
  onComplete: (data: ProfessionalWizardData) => void;
  loading?: boolean;
}

export const ProfessionalWizard = ({ onComplete, loading }: ProfessionalWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProfessionalWizardData>>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = (stepData: any) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);
    
    if (currentStep === totalSteps) {
      onComplete(newFormData as ProfessionalWizardData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Daily Wage Information";
      case 2: return "Work Experience";
      case 3: return "Skills & Technologies";
      case 4: return "Education Background";
      case 5: return "Terms & Conditions";
      default: return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Professional Profile Setup</h2>
        <p className="text-muted-foreground">Step {currentStep} of {totalSteps}: {getStepTitle()}</p>
        <Progress value={progress} className="w-full" />
      </div>

      {currentStep === 1 && (
        <WageStep 
          onNext={handleNext} 
          defaultValues={formData as Partial<WageFormData>}
        />
      )}
      
      {currentStep === 2 && (
        <ExperienceStep 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          defaultValues={formData as Partial<ExperienceFormData>}
        />
      )}
      
      {currentStep === 3 && (
        <SkillsStep 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          defaultValues={formData as Partial<SkillsFormData>}
        />
      )}
      
      {currentStep === 4 && (
        <EducationStep 
          data={{ educations: (formData as EducationFormData)?.educations || [] }}
          onNext={handleNext} 
          onPrevious={handlePrevious}
        />
      )}
      
      {currentStep === 5 && (
        <TermsStep 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          loading={loading}
          defaultValues={formData as Partial<TermsFormData>}
        />
      )}
    </div>
  );
};

// Step Components
const WageStep = ({ onNext, defaultValues }: { onNext: (data: WageFormData) => void; defaultValues?: Partial<WageFormData> }) => {
  const form = useForm<WageFormData>({
    resolver: zodResolver(wageSchema),
    defaultValues: defaultValues || { dailyWageNet: 0 },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="dailyWageNet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Daily Wage (Net) in €</FormLabel>
              <FormDescription>
                Specify your minimum expected daily wage after taxes
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Next Step
        </Button>
      </form>
    </Form>
  );
};

const ExperienceStep = ({ onNext, onPrevious, defaultValues }: { 
  onNext: (data: ExperienceFormData) => void; 
  onPrevious: () => void;
  defaultValues?: Partial<ExperienceFormData>;
}) => {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: defaultValues || { 
      workExperienceSummary: "",
      workExperiences: [{
        position: "",
        company: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        description: "",
        isCurrentJob: false,
      }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workExperiences"
  });

  const addWorkExperience = () => {
    append({
      position: "",
      company: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: "",
      isCurrentJob: false,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        {/* Experience Summary */}
        <FormField
          control={form.control}
          name="workExperienceSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Experience Summary</FormLabel>
              <FormDescription>
                Provide an overview of your professional background and career highlights
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Summarize your professional experience, highlighting your key strengths and areas of expertise..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Detailed Work Experiences */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detailed Work Experience</h3>
            <Button type="button" onClick={addWorkExperience} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`workExperiences.${index}.position`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Project Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`workExperiences.${index}.company`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tech Solutions Ltd." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Start Date</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`workExperiences.${index}.startMonth`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="January">January</SelectItem>
                                <SelectItem value="February">February</SelectItem>
                                <SelectItem value="March">March</SelectItem>
                                <SelectItem value="April">April</SelectItem>
                                <SelectItem value="May">May</SelectItem>
                                <SelectItem value="June">June</SelectItem>
                                <SelectItem value="July">July</SelectItem>
                                <SelectItem value="August">August</SelectItem>
                                <SelectItem value="September">September</SelectItem>
                                <SelectItem value="October">October</SelectItem>
                                <SelectItem value="November">November</SelectItem>
                                <SelectItem value="December">December</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`workExperiences.${index}.startYear`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>End Date</FormLabel>
                    <div className="flex items-center space-x-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`workExperiences.${index}.isCurrentJob`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue(`workExperiences.${index}.endMonth`, "");
                                    form.setValue(`workExperiences.${index}.endYear`, "");
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>I currently work here</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    {!form.watch(`workExperiences.${index}.isCurrentJob`) && (
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`workExperiences.${index}.endMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="January">January</SelectItem>
                                  <SelectItem value="February">February</SelectItem>
                                  <SelectItem value="March">March</SelectItem>
                                  <SelectItem value="April">April</SelectItem>
                                  <SelectItem value="May">May</SelectItem>
                                  <SelectItem value="June">June</SelectItem>
                                  <SelectItem value="July">July</SelectItem>
                                  <SelectItem value="August">August</SelectItem>
                                  <SelectItem value="September">September</SelectItem>
                                  <SelectItem value="October">October</SelectItem>
                                  <SelectItem value="November">November</SelectItem>
                                  <SelectItem value="December">December</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`workExperiences.${index}.endYear`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

              <FormField
                control={form.control}
                name={`workExperiences.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormDescription>
                      Describe your responsibilities, achievements, and key projects
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your role and key achievements... (numbers, data, facts)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">
            Previous
          </Button>
          <Button type="submit" className="flex-1">
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
};

const SkillsStep = ({ onNext, onPrevious, defaultValues }: { 
  onNext: (data: SkillsFormData) => void; 
  onPrevious: () => void;
  defaultValues?: Partial<SkillsFormData>;
}) => {
  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: defaultValues || { skills: [], languages: [], technologies: [] },
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"junior" | "medior" | "senior" | "expert">("medior");
  const [newTechnology, setNewTechnology] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced" | "native">("intermediate");

  const addItem = (type: 'technologies', value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    
    const currentItems = form.getValues(type) || [];
    if (!currentItems.includes(value.trim())) {
      form.setValue(type, [...currentItems, value.trim()]);
      setValue("");
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues("skills") || [];
    if (!currentSkills.find(skill => skill.skill === newSkill.trim())) {
      form.setValue("skills", [...currentSkills, { skill: newSkill.trim(), level: newSkillLevel }]);
      setNewSkill("");
      setNewSkillLevel("medior");
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter((_, i) => i !== index));
  };

  const removeItem = (type: 'technologies', index: number) => {
    const currentItems = form.getValues(type) || [];
    form.setValue(type, currentItems.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (!selectedLanguage.trim()) return;
    
    const currentLanguages = form.getValues("languages") || [];
    if (!currentLanguages.find(lang => lang.language === selectedLanguage.trim())) {
      form.setValue("languages", [...currentLanguages, { language: selectedLanguage.trim(), level: selectedLevel }]);
      setSelectedLanguage("");
      setSelectedLevel("intermediate");
    }
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = form.getValues("languages") || [];
    form.setValue("languages", currentLanguages.filter((_, i) => i !== index));
  };

  const skills = form.watch("skills") || [];
  const languages = form.watch("languages") || [];
  const technologies = form.watch("technologies") || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <FormLabel>Skills</FormLabel>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1"
                />
                
                <Select value={newSkillLevel} onValueChange={(value: "junior" | "medior" | "senior" | "expert") => setNewSkillLevel(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="medior">Medior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  disabled={!newSkill.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill.skill} ({skill.level})
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FormLabel>Languages</FormLabel>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto" position="popper" sideOffset={4}>
                    {AVAILABLE_LANGUAGES.filter(lang => !languages.find(l => l.language === lang)).map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedLevel} onValueChange={(value: "beginner" | "intermediate" | "advanced" | "native") => setSelectedLevel(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  onClick={addLanguage}
                  size="sm"
                  disabled={!selectedLanguage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {language.language} ({language.level})
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLanguage(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FormLabel>Technologies</FormLabel>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a technology"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('technologies', newTechnology, setNewTechnology);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addItem('technologies', newTechnology, setNewTechnology)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((technology, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {technology}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeItem('technologies', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">
            Previous
          </Button>
          <Button type="submit" className="flex-1">
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
};

const TermsStep = ({ onNext, onPrevious, loading, defaultValues }: { 
  onNext: (data: TermsFormData) => void; 
  onPrevious: () => void;
  loading?: boolean;
  defaultValues?: Partial<TermsFormData>;
}) => {
  const { termsUrl } = useTermsConditions();
  const form = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: defaultValues || { acceptTerms: false },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review and Accept Terms</h3>
          <div className="p-4 border rounded-lg space-y-2 text-sm">
            <p><strong>Professional Terms & Conditions</strong></p>
            <p>By completing this registration, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate and up-to-date professional information</li>
              <li>Maintain professional standards in all client interactions</li>
              <li>Comply with platform guidelines and policies</li>
              <li>Allow your profile to be reviewed and approved by our team</li>
              <li>Understand that your profile will only be visible after approval</li>
            </ul>
          </div>
        </div>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the{" "}
                  {termsUrl ? (
                    <a 
                      href={termsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Professional Privacy policy
                    </a>
                  ) : (
                    <span className="text-primary underline underline-offset-4">
                      Professional Privacy policy
                    </span>
                  )}
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">
            Previous
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Completing Profile..." : "Complete Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};