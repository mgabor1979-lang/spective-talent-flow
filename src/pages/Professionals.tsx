import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SearchBar, SearchGroup } from '@/components/ui/SearchBar';
import { GoToTop } from '@/components/ui/GoToTop';
import { User, Loader2, ArrowDownAZ } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { DATA_SEPARATORS } from '@/lib/data-separators';
import { formatDistance, batchCalculateDistances } from '@/lib/distance-utils';
import { isCompanyUser } from '@/lib/auth-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Fuse from 'fuse.js';

interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  birth_date?: string;
  age?: number;
  work_experience?: string;
  education?: string;
  skills?: string[];
  languages?: string[];
  technologies?: string[];
  daily_wage_net?: number;
  city?: string;
  distance?: number;
  available?: boolean;
  available_from?: string;
  profile_image?: string;
}

type SortBy = 'default' | 'relevance' | 'distance' | 'availability';

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Helper function to extract company names from work experience
const extractCompanyNames = (workExperience: string): string => {
  if (!workExperience) return '';

  // Split by work experience separator to get individual job entries
  const jobEntries = workExperience.split(DATA_SEPARATORS.WORK_EXPERIENCE);
  const companyNames: string[] = [];

  jobEntries.forEach(entry => {
    const lines = entry.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Pattern 1: "Position at Company Name"
      const atRegex = /\bat\s+([^,\n\r(]+)/i;
      const atMatch = atRegex.exec(trimmedLine);
      if (atMatch) {
        companyNames.push(atMatch[1].trim());
      }

      // Pattern 2: "Company Name - Position" or "Company Name | Position"
      const dashRegex = /^([^-|]+)[-|]/;
      const dashMatch = dashRegex.exec(trimmedLine);
      if (dashMatch) {
        const potential = dashMatch[1].trim();
        const digitRegex = /^\d+/;
        if (potential.length > 2 && !digitRegex.exec(potential) && potential.includes(' ')) {
          companyNames.push(potential);
        }
      }

      // Pattern 3: Look for lines that might be company names (usually at the start of entries)
      // Skip if it looks like a date, position title, or description
      const dateRegex = /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/;
      const commonTitles = /^(manager|director|consultant|analyst|developer|engineer|specialist|coordinator|assistant|lead|senior|junior)/i;

      if (!dateRegex.exec(trimmedLine) &&
        !commonTitles.exec(trimmedLine) &&
        trimmedLine.length > 3 &&
        trimmedLine.length < 100 &&
        !trimmedLine.includes(':') &&
        !trimmedLine.includes('•')) {
        // Might be a company name
        companyNames.push(trimmedLine);
      }
    });
  });

  // Remove duplicates and join
  return [...new Set(companyNames)].join(' ');
};

// Helper function to extract experience summary
const getExperienceSummary = (workExperience: string): string => {
  if (!workExperience) return 'No professional experience provided.';
  const sections = workExperience.split(DATA_SEPARATORS.WORK_EXPERIENCE);
  return sections[0] || 'No professional experience provided.';
};

// Helper function to parse skills
const parseSkills = (skills: string[]): string[] => {
  if (!skills) return [];
  const regex = /^(.+?)\s*\(/;
  return skills.map(skill => {
    const match = regex.exec(skill);
    return match ? match[1] : skill;
  });
};

// Helper function to parse languages
const parseLanguages = (languages: string[]): string[] => {
  if (!languages) return [];
  const regex = /^(.+?)\s*\(/;
  return languages.map(language => {
    const match = regex.exec(language);
    return match ? match[1] : language;
  });
};

// Helper function to get availability status text
const getAvailabilityText = (available: boolean, availableFrom?: string): string => {
  if (available) {
    return 'Available now';
  }
  if (availableFrom) {
    return `Available from ${new Date(availableFrom).toLocaleDateString()}`;
  }
  return 'Currently unavailable';
};

// Helper function to extract first name (keresztnév) - last part of the full name
const getFirstName = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  return nameParts[nameParts.length - 1]; // Last part is the keresztnév
};

// Helper function to extract surname (vezetéknév) - first part of the full name
const getSurname = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  return nameParts[0]; // First part is the vezetéknév
};

export const Professionals = () => {

  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([
    { id: 'group-1', badges: [], inputValue: '' }
  ]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const [companyAddress, setCompanyAddress] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('default');

  useEffect(() => {
    const checkAuthAndFetchProfessionals = async () => {
      try {
        // Check if user is a company user and get their address
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const companyUser = await isCompanyUser(session.user.id);
          setIsCompany(companyUser);

          if (companyUser) {
            const { data: companyProfile } = await supabase
              .from('company_profiles')
              .select('address')
              .eq('user_id', session.user.id)
              .single();

            if (companyProfile?.address) {
              setCompanyAddress(companyProfile.address);
            }
          }
        }

        // Use the secure database function that handles data masking
        const { data, error } = await supabase.rpc('get_professionals_for_public');

        if (error) {
          console.error('Error fetching professionals:', error);
          return;
        }

        // Transform the data to match our interface
        const transformedData: Professional[] = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          full_name: item.masked_full_name,
          birth_date: item.birth_date,
          age: item.age,
          work_experience: item.work_experience,
          education: item.education || '', // Fallback to empty string if not available
          skills: item.skills || [],
          languages: item.languages || [],
          technologies: item.technologies || [],
          daily_wage_net: null, // Not exposed in professionals list
          city: item.city || '',
          available: item.available,
          available_from: item.availablefrom,
          profile_image: item.profile_image_src || null,
        }));

        // Calculate distances for company users
        if (isCompany && companyAddress) {
          const professionalCities = transformedData.map(p => p.city).filter(Boolean);
          const distances = await batchCalculateDistances(companyAddress, professionalCities);

          const professionalsWithDistance = transformedData.map((professional, index) => {
            if (!professional.city) {
              return professional;
            }
            const cityIndex = professionalCities.indexOf(professional.city);
            const distance = cityIndex >= 0 ? distances[cityIndex] : null;
            return { ...professional, distance };
          });

          setProfessionals(professionalsWithDistance);
        } else {
          setProfessionals(transformedData);
        }
      } catch (error) {
        console.error('Error in fetchProfessionals:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfessionals();
  }, [isCompany, companyAddress]);

  // Configure Fuse.js for fuzzy search - professional info + names + company names
  const fuseOptions = {
    keys: [
      { name: 'full_name', weight: 5 },        // Include names for search
      { name: 'work_experience', weight: 3 },  // Highest priority - work experience (includes company names)
      { name: 'education', weight: 3 },        // Highest priority - education
      { name: 'skills', weight: 2.5 },         // High priority - skills
      { name: 'technologies', weight: 2 },     // Medium priority - technologies  
      { name: 'languages', weight: 1.5 },     // Lower priority - languages
    ],
    threshold: 0.15, // Stricter threshold for more accurate results (was 0.3)
    distance: 100,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
    shouldSort: true,
  };

  const fuse = useMemo(() => {
    // Prepare data for search - include names and extract company names from work experience
    const searchableData = professionals.map(professional => ({
      ...professional,
      work_experience: getExperienceSummary(professional.work_experience || '') + ' ' +
        extractCompanyNames(professional.work_experience || ''),
      education: professional.education || '',
      skills: parseSkills(professional.skills || []).join(' '),
      languages: parseLanguages(professional.languages || []).join(' '),
      technologies: (professional.technologies || []).join(' '),
      full_name: professional.full_name, // Include names for search
    }));
    return new Fuse(searchableData, fuseOptions);
  }, [professionals]);

  const filteredProfessionals = useMemo(() => {
    // If no search groups have any badges, return all professionals
    const hasAnySearchTerms = searchGroups.some(group => group.badges.length > 0);

    let filtered: Professional[];

    if (!hasAnySearchTerms) {
      filtered = professionals;
    } else {
      // Helper function to check if a professional matches a badge
      const professionalMatchesBadge = (professional: Professional, badge: string): boolean => {
        const results = fuse.search(badge);

        const matches = results.some(result =>
          result.item.id === professional.id &&
          result.score !== undefined &&
          result.score <= 0.15 // Stricter threshold (was 0.3)
        );

        return matches;
      };

      // Helper function to check if a professional matches a group (OR logic)
      const professionalMatchesGroup = (professional: Professional, group: SearchGroup): boolean => {
        if (group.badges.length === 0) return true;
        const matches = group.badges.some(badge => professionalMatchesBadge(professional, badge));
        return matches;
      };

      // Filter professionals based on search groups with AND/OR logic
      filtered = professionals.filter(professional => {
        // Each group is ANDed together
        const matches = searchGroups.every(group => professionalMatchesGroup(professional, group));
        return matches;
      });
    }

    // Apply sorting
    const sorted = [...filtered];

    // Helper function for secondary A-Z sorting by name
    const sortByName = (a: Professional, b: Professional) => {
      return a.full_name.localeCompare(b.full_name);
    };

    if (sortBy === 'relevance' && hasAnySearchTerms) {
      // Sort by relevance (search score)
      sorted.sort((a, b) => {
        const searchTerms = searchGroups.flatMap(group => group.badges);

        // Calculate average score for each professional
        const getAverageScore = (professional: Professional) => {
          const scores = searchTerms.map(term => {
            const results = fuse.search(term);
            const match = results.find(r => r.item.id === professional.id);
            return match?.score ?? 1; // Lower score is better
          });
          return scores.reduce((sum, score) => sum + score, 0) / scores.length;
        };

        const scoreA = getAverageScore(a);
        const scoreB = getAverageScore(b);

        return scoreA - scoreB; // Lower score first
      });
    } else if (sortBy === 'distance' && isCompany) {
      // Sort by distance (closest first), then A-Z
      sorted.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;

        if (distA !== distB) {
          return distA - distB;
        }
        return sortByName(a, b);
      });
    } else if (sortBy === 'availability') {
      // Sort by availability (available now first, then by available_from date, then unavailable), then A-Z
      sorted.sort((a, b) => {
        // Available now = 0, available from date = timestamp, unavailable = Infinity
        const getAvailabilityValue = (prof: Professional) => {
          if (prof.available) return 0;
          if (prof.available_from) return new Date(prof.available_from).getTime();
          return Infinity;
        };

        const availA = getAvailabilityValue(a);
        const availB = getAvailabilityValue(b);

        if (availA !== availB) {
          return availA - availB;
        }
        return sortByName(a, b);
      });
    } else {
      // Default: sort by name A-Z (when sortBy is 'default' or any other value)
      sorted.sort(sortByName);
    }

    return sorted;
  }, [professionals, searchGroups, fuse, sortBy, isCompany]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading professionals...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <GoToTop />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-spective-dark to-spective-gray text-primary-foreground h-[30vh] flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-4xl font-bold mb-6">Our Professionals</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover experienced interim managers and consultants ready to drive your transformation projects
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Search and Sorting */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
          {/* Search - 10 parts on desktop */}
          <div className="flex-1 lg:w-9/12">
            <SearchBar
              searchGroups={searchGroups}
              onSearchGroupsChange={setSearchGroups}
              placeholder="Type and press Enter to add search terms..."
              resultsCount={filteredProfessionals.length}
              showResultsCount={true}
              storageKey="professionals-search-groups"
            />
          </div>

          {/* Sorting - 2 parts on desktop */}
          <div className="lg:w-3/12 flex flex-col items-end justify-end gap-3">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-5 w-5 text-spective-accent" />
              <h2 className="text-lg font-semibold">Sorting</h2>
            </div>
            <div className="flex full-width flex-row items-center justify-end gap-3">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger id="sort-select" className="w-[200px]">
                  <SelectValue placeholder="Name (A-Z)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Name (A-Z)</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  {isCompany && <SelectItem value="distance">Distance</SelectItem>}
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => {
            // Use age from backend if available, otherwise calculate from birth_date
            const age = professional.age || (professional.birth_date ? calculateAge(professional.birth_date) : null);
            const experienceSummary = getExperienceSummary(professional.work_experience || '');
            const firstName = professional.full_name;
            const surname = getSurname(professional.full_name);

            return (
              <Card key={professional.id} className={`h-full hover:shadow-lg transition-shadow ${!professional.available ? 'bg-gray-100' : ''}`}>
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className={`h-16 w-16 ${!professional.available ? 'grayscale' : ''}`}>
                      <AvatarImage src={professional.profile_image || undefined} />
                      <AvatarFallback className="bg-spective-accent text-white text-lg">
                        {surname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${professional.user_id}`} className="text-black hover:text-black">
                          <h3 className="text-xl font-semibold">{firstName}</h3>
                        </Link>
                        {/* Availability indicator */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 rounded-full border border-white transition-all ${professional.available
                                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                                    : 'bg-red-500 shadow-lg shadow-red-500/50'
                                  }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">
                                {professional.available ? 'Available Now' : 'Not Available'}
                              </p>
                              <p className="text-xs mt-1">
                                {getAvailabilityText(
                                  professional.available || false,
                                  professional.available_from || undefined
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className='text-muted-foreground'>
                        {Boolean(age) && <span className="text-muted-foreground">{age} years old</span>}
                        {isCompany && professional.distance !== undefined && (
                          <>
                            {Boolean(age) && <span className="text-muted-foreground"> • </span>}
                            <span className="text-blue-600 font-medium">
                              {formatDistance(professional.distance)} away
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <h4 className="font-medium mb-2">Professional Experience</h4>
                    <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {experienceSummary}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-spective-accent hover:bg-spective-accent/90 mt-auto">
                    <Link to={`/profile/${professional.user_id}`}>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProfessionals.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchGroups.some(group => group.badges.length > 0)
                ? "No professionals found matching your search criteria."
                : "No professionals found."
              }
            </p>
            {searchGroups.some(group => group.badges.length > 0) && (
              <Button
                variant="outline"
                onClick={() => setSearchGroups([{ id: 'group-1', badges: [], inputValue: '' }])}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};