import React from 'react';

interface CVDocumentProps {
  profileData: any;
  parsedData: any;
  options: {
    hideName: boolean;
    hideEmail: boolean;
    hideMobile: boolean;
    hideWage: boolean;
    logo: string | null;
  };
}

export const CVDocument = ({ profileData, parsedData, options }: CVDocumentProps) => {
  const { skills, languages, technologies, experienceSummary, workExperiences, educations } = parsedData;

  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    if (options.hideMobile) return '*'.repeat(phone.length);
    return phone;
  };

  const formatEmail = (email: string): string => {
    if (!email) return '';
    if (options.hideEmail) {
      const [name, domain] = email.split('@');
      return '*'.repeat(name.length) + '@' + '*'.repeat(domain.length);
    }
    return email;
  };

  const formatWage = (wage: number | string): string => {
    if (options.hideWage) return '****';
    if (typeof wage === 'number') {
      return `${wage.toLocaleString()} HUF/day`;
    }
    return wage?.toString() || 'N/A';
  };

  const displayName = options.hideName 
    ? '*'.repeat(profileData.full_name.length)
    : profileData.full_name;

  const getAvailabilityText = () => {
    if (profileData.professional_profile.available) {
      return 'Available Now';
    }
    if (profileData.professional_profile.availablefrom) {
      return `Available from ${new Date(profileData.professional_profile.availablefrom).toLocaleDateString()}`;
    }
    return 'Currently Unavailable';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-300">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2563eb' }}>
            {displayName}
          </h1>
          
          <div className="space-y-2 text-sm">
            {profileData.email && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Email:</span>
                <span>{formatEmail(profileData.email)}</span>
              </div>
            )}
            {profileData.phone && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Phone:</span>
                <span>{formatPhone(profileData.phone)}</span>
              </div>
            )}
            {profileData.professional_profile?.city && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Location:</span>
                <span>{profileData.professional_profile.city}</span>
              </div>
            )}
            {profileData.age && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Age:</span>
                <span>{profileData.age} years old</span>
              </div>
            )}
            {profileData.professional_profile?.daily_wage_net && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Daily Rate:</span>
                <span>{formatWage(profileData.professional_profile.daily_wage_net)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        {options.logo && (
          <div className="ml-8">
            <img 
              src={options.logo} 
              alt="Company Logo" 
              className="max-w-32 max-h-24 object-contain"
            />
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {experienceSummary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
            Professional Summary
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {experienceSummary}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, index) => {
              const skillMatch = typeof skill === 'string' ? skill.match(/^(.+?)\s*\((.+?)\)$/) : null;
              const skillName = skillMatch ? skillMatch[1] : skill;
              const skillLevel = skillMatch ? skillMatch[2] : 'intermediate';
              
              return (
                <div key={`skill-${skillName}-${index}`} className="flex justify-between items-center py-1">
                  <span className="font-medium">{skillName}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                    {skillLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Languages & Technologies */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
              Languages
            </h2>
            <div className="space-y-2">
              {languages.map((language, index) => {
                const langMatch = typeof language === 'string' ? language.match(/^(.+?)\s*\((.+?)\)$/) : null;
                const langName = langMatch ? langMatch[1] : language;
                const langLevel = langMatch ? langMatch[2] : 'intermediate';
                
                return (
                  <div key={`lang-${langName}-${index}`} className="flex justify-between items-center">
                    <span className="font-medium">{langName}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                      {langLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Technologies */}
        {technologies.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
              Technologies & Tools
            </h2>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, index) => (
                <span
                  key={`tech-${tech}-${index}`}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Work Experience */}
      {workExperiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
            Work Experience
          </h2>
          <div className="space-y-6">
            {workExperiences.map((exp, index) => (
              <div key={`exp-${exp.position}-${exp.company}-${index}`} className="relative pl-4 border-l-2 border-gray-200">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-2 top-2"></div>
                <div className="mb-2">
                  <h3 className="font-bold text-lg">{exp.position}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-blue-600 font-semibold">{exp.company}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {exp.duration}
                    </span>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200" style={{ color: '#2563eb' }}>
            Education
          </h2>
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <div key={`edu-${edu.degree}-${edu.school}-${index}`} className="relative pl-4 border-l-2 border-gray-200">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-2 top-2"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{edu.degree}</h3>
                    <p className="text-blue-600 font-semibold">{edu.school}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {edu.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      

      

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>CV generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};