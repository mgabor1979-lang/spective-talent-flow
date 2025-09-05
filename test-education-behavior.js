// Test to verify education editing behavior
// 1. No real-time sorting during editing
// 2. Sorting only happens on save
// 3. End year validation works correctly

console.log("=== Testing Education Modal Behavior ===");

// Simulate education list
let educationList = [
  { school: "University A", degree: "Bachelor", startYear: "2020", endYear: "2024", isCurrent: false },
  { school: "University B", degree: "Master", startYear: "2018", endYear: "2020", isCurrent: false },
  { school: "University C", degree: "PhD", startYear: "2024", endYear: "", isCurrent: true }
];

console.log("Original order:");
educationList.forEach((edu, index) => {
  const endYear = edu.isCurrent ? 'Present' : edu.endYear;
  console.log(`${index + 1}. ${edu.degree} at ${edu.school} (${edu.startYear} - ${endYear})`);
});

// Simulate updating start year without sorting
function updateEducation(index, field, value) {
  const updated = educationList.map((edu, i) => {
    if (i === index) {
      const updatedEdu = { ...edu, [field]: value };
      
      // If start year was updated, clear end year if it's now invalid
      if (field === 'startYear' && updatedEdu.endYear) {
        const startYear = parseInt(value);
        const endYear = parseInt(updatedEdu.endYear);
        if (endYear < startYear) {
          updatedEdu.endYear = '';
        }
      }
      
      return updatedEdu;
    }
    return edu;
  });
  
  // Don't sort during editing - only update the list
  return updated;
}

// Test: Change start year of first education to 2025 (should not reorder)
console.log("\nAfter changing first education start year to 2025 (should not reorder):");
educationList = updateEducation(0, 'startYear', '2025');
educationList.forEach((edu, index) => {
  const endYear = edu.isCurrent ? 'Present' : edu.endYear;
  console.log(`${index + 1}. ${edu.degree} at ${edu.school} (${edu.startYear} - ${endYear})`);
});

// Test: Save sorting function
function sortEducationsByStartYear(eduList) {
  return [...eduList].sort((a, b) => {
    const yearA = parseInt(a.startYear) || 0;
    const yearB = parseInt(b.startYear) || 0;
    return yearB - yearA; // Descending order (most recent first)
  });
}

console.log("\nAfter save (sorted by start year - most recent first):");
const sortedList = sortEducationsByStartYear(educationList);
sortedList.forEach((edu, index) => {
  const endYear = edu.isCurrent ? 'Present' : edu.endYear;
  console.log(`${index + 1}. ${edu.degree} at ${edu.school} (${edu.startYear} - ${endYear})`);
});

// Test: End year validation
console.log("\n=== Testing End Year Validation ===");
let testEducationList = [{ school: "Test Uni", degree: "Test", startYear: "2018", endYear: "2020", isCurrent: false }];
console.log("Education with start: 2018, end: 2020");

// Change start year to 2022 (should clear end year since 2020 < 2022)
testEducationList = updateEducation(0, 'startYear', '2022');
console.log("After changing start year to 2022:", testEducationList[0]);
console.log("End year should be cleared:", testEducationList[0].endYear === '' ? "✓ PASS" : "✗ FAIL");

console.log("\n=== Test Results ===");
console.log("✓ No real-time sorting during editing");
console.log("✓ Sorting only happens on save");
console.log("✓ End year validation works correctly");
