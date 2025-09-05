/**
 * Data separators used throughout the application
 * These unique separators prevent issues with long text that might contain natural line breaks
 */

export const DATA_SEPARATORS = {
  WORK_EXPERIENCE: '|||WORK_EXP_SEPARATOR|||',
  EDUCATION: '|||EDU_SEPARATOR|||',
} as const;

/**
 * Helper functions for parsing data with separators
 */

export const parseWorkExperienceData = (workExperienceText: string) => {
  if (!workExperienceText) {
    return { summary: "", sections: [] };
  }
  
  const sections = workExperienceText.split(DATA_SEPARATORS.WORK_EXPERIENCE);
  const summary = sections[0] || "";
  const experiences = sections.slice(1);
  
  return { summary, sections: experiences };
};

export const parseEducationData = (educationText: string) => {
  if (!educationText) {
    return [];
  }
  
  return educationText.split(DATA_SEPARATORS.EDUCATION);
};

export const joinWorkExperienceData = (summary: string, experiences: string[]) => {
  return [summary, ...experiences].join(DATA_SEPARATORS.WORK_EXPERIENCE);
};

export const joinEducationData = (educationItems: string[]) => {
  return educationItems.join(DATA_SEPARATORS.EDUCATION);
};
