// Test file to verify education sorting functionality
const DATA_SEPARATORS = {
  EDUCATION: '••EDUCATION_SEPARATOR••'
};

// Function to parse education from database (simplified version)
const parseEducation = (educationText) => {
  if (!educationText) {
    return [];
  }

  // Use a unique separator that won't appear in normal text
  const sections = educationText.split(DATA_SEPARATORS.EDUCATION);
  const educations = [];

  for (const section of sections) {
    if (section.trim()) {
      // Try to parse format: "Degree at School (startYear - endYear)"
      const match = section.match(/^(.+?)\s+at\s+(.+?)\s+\((.+?)\)$/);
      if (match) {
        const [, degree, school, duration] = match;
        educations.push({
          degree: degree.trim(),
          school: school.trim(),
          duration: duration.trim()
        });
      }
    }
  }

  // Sort educations by start year (descending - most recent first)
  return educations.sort((a, b) => {
    const getStartYear = (duration) => {
      const startYearMatch = duration.match(/^(\d{4})/);
      return startYearMatch ? parseInt(startYearMatch[1]) : 0;
    };
    
    const startYearA = getStartYear(a.duration);
    const startYearB = getStartYear(b.duration);
    
    return startYearB - startYearA; // Descending order (most recent first)
  });
};

// Function to sort education list by start year (for EditEducationModal)
const sortEducationsByStartYear = (eduList) => {
  return [...eduList].sort((a, b) => {
    const yearA = parseInt(a.startYear) || 0;
    const yearB = parseInt(b.startYear) || 0;
    return yearB - yearA; // Descending order (most recent first)
  });
};

// Test data
const testEducationText = [
  "Bachelor of Computer Science at University of Technology (2018 - 2022)",
  "Master of Software Engineering at Tech Institute (2022 - 2024)", 
  "PhD in Computer Science at Research University (2024 - Present)",
  "Certificate in Web Development at Coding School (2017 - 2018)"
].join(DATA_SEPARATORS.EDUCATION);

const testEducationList = [
  { school: "University of Technology", degree: "Bachelor of Computer Science", startYear: "2018", endYear: "2022", isCurrent: false },
  { school: "Tech Institute", degree: "Master of Software Engineering", startYear: "2022", endYear: "2024", isCurrent: false },
  { school: "Research University", degree: "PhD in Computer Science", startYear: "2024", endYear: "", isCurrent: true },
  { school: "Coding School", degree: "Certificate in Web Development", startYear: "2017", endYear: "2018", isCurrent: false }
];

console.log("=== Testing parseEducation function ===");
const parsedEducations = parseEducation(testEducationText);
console.log("Parsed and sorted educations:");
parsedEducations.forEach((edu, index) => {
  console.log(`${index + 1}. ${edu.degree} at ${edu.school} (${edu.duration})`);
});

console.log("\n=== Testing sortEducationsByStartYear function ===");
const sortedEducationList = sortEducationsByStartYear(testEducationList);
console.log("Sorted education list:");
sortedEducationList.forEach((edu, index) => {
  const endYear = edu.isCurrent ? 'Present' : edu.endYear;
  console.log(`${index + 1}. ${edu.degree} at ${edu.school} (${edu.startYear} - ${endYear})`);
});

console.log("\n=== Expected order (most recent first) ===");
console.log("1. PhD in Computer Science at Research University (2024 - Present)");
console.log("2. Master of Software Engineering at Tech Institute (2022 - 2024)");
console.log("3. Bachelor of Computer Science at University of Technology (2018 - 2022)");
console.log("4. Certificate in Web Development at Coding School (2017 - 2018)");
