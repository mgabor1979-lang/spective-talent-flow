import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font
} from '@react-pdf/renderer';

// Register Roboto font family with Hungarian character support
Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
            fontWeight: 300,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
            fontWeight: 'normal',
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
            fontWeight: 500,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
            fontWeight: 'bold',
        }
    ]
});

// Define styles for the PDF document matching CVDocument exactly
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontSize: 12,
        lineHeight: 1.4,
        fontFamily: 'Roboto',
    },

    // Header Section Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32, // mb-8
        paddingBottom: 12, // pb-6
    },
    headerLeft: {
        flex: 1,
        maxWidth: '65%', // flex-grow
        width: '65%',
    },
    headerRight: {
        maxWidth: '30%', // ml-8
        width: '30%',
        alignItems: 'flex-end',
    },
    logo: {
        maxWidth: '100%', // max-h-24
        width: '100%',
        maxHeight: '64px',
        height: 'auto',
        textAlign: 'right',
        alignSelf: 'flex-end',
        objectFit: 'contain',
    },

    // Name and role styles
    name: {
        fontSize: 22, // text-3xl
        fontWeight: 'bold',
        marginBottom: 8, // mb-2
    },

    // Contact info styles
    contactInfoContainer: {
        gap: 8, // space-y-2
        fontSize: 14, // text-sm
        maxWidth: '100%',
        paddingTop: 8,
    },
    contactInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        justifyItems: 'space-between',
        marginBottom: 4,
        marginTop: 4,
        paddingTop:4,
        fontSize: 14, // text-sm
        gap: 8, // space-x-2
    },
    contactLabel: {
        fontWeight: 'bold',
    },

    // Section styles
    section: {
        marginBottom: 32, // mb-8
    },
    sectionTitle: {
        fontSize: 18, // text-xl
        fontWeight: 'bold',
        marginBottom: 16, // mb-4
        paddingBottom: 8, // pb-2
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb', // border-gray-200
    },

    // Professional summary
    summaryText: {
        color: '#374151', // text-gray-700
        lineHeight: 1, // leading-relaxed
    },

    // Skills section
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16, // gap-4 - but we'll handle this manually
    },
    skillsColumn: {
        width: '48%',
    },
    skillRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // py-1
        marginBottom: 4,
        fontSize: 12,
    },
    skillName: {
        fontWeight: 'medium',
        maxWidth: '70%',
    },
    skillLevel: {
        fontSize: 10, // text-xs
        backgroundColor: '#f3f4f6', // bg-gray-100
        paddingHorizontal: 4, // px-2
        borderRadius: 5, // rounded
        textTransform: 'capitalize',
    },

    // Experience section
    experienceContainer: {
        gap: 24, // space-y-6
    },
    experienceItem: {
        position: 'relative',
        paddingLeft: 16, // pl-4
        borderLeftWidth: 2,
        borderLeftColor: '#e5e7eb', // border-gray-200
        marginBottom: 8,
    },
    experienceDot: {
        position: 'absolute',
        left: -6, // -left-2 (half of 12px width)
        top: 8, // top-2
        width: 12, // w-3
        height: 12, // h-3
        backgroundColor: '#2563eb', // bg-blue-600
        borderRadius: 6, // rounded-full
    },
    experienceHeader: {
        marginBottom: 8, // mb-2
    },
    experienceTitle: {
        fontSize: 14, // text-lg
        fontWeight: 'bold',
        marginBottom: 4,
    },
    experienceCompanyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    experienceCompany: {
        color: '#2563eb', // text-blue-600
        fontWeight: 'semibold',
    },
    experienceDuration: {
        fontSize: 10, // text-xs
        backgroundColor: '#f3f4f6', // bg-gray-100
        paddingHorizontal: 8, // px-2
        paddingVertical: 4, // py-1
        borderRadius: 3, // rounded
    },
    experienceDescription: {
        color: '#374151', // text-gray-700
        lineHeight: 1, // leading-relaxed
    },

    // Education section
    educationContainer: {
        gap: 16, // space-y-4
    },
    educationItem: {
        position: 'relative',
        paddingLeft: 16, // pl-4
        borderLeftWidth: 2,
        borderLeftColor: '#e5e7eb', // border-gray-200
        marginBottom: 16,
    },
    educationDot: {
        position: 'absolute',
        left: -6, // -left-2
        top: 8, // top-2
        width: 12, // w-3
        height: 12, // h-3
        backgroundColor: '#2563eb', // bg-blue-600
        borderRadius: 6, // rounded-full
    },
    educationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    educationLeft: {
        flex: 1,
    },
    educationTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    educationSchool: {
        color: '#2563eb', // text-blue-600
        fontWeight: 'semibold',
    },

    // Languages & Technologies section
    twoColumnGrid: {
        flexDirection: 'row',
        gap: 32, // gap-8
        marginBottom: 32, // mb-8
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
    },
    languageContainer: {
        gap: 8, // space-y-2
    },
    languageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    languageName: {
        fontWeight: 'medium',
    },
    languageLevel: {
        fontSize: 10, // text-xs
        backgroundColor: '#f3f4f6', // bg-gray-100
        paddingHorizontal: 8, // px-2
        paddingVertical: 4, // py-1
        borderRadius: 3, // rounded
        textTransform: 'capitalize',
    },

    // Technologies
    technologiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-2
    },
    technologyTag: {
        fontSize: 10, // text-xs
        backgroundColor: '#f3f4f6', // bg-gray-100
        paddingHorizontal: 8, // px-2
        paddingVertical: 4, // py-1
        borderRadius: 3, // rounded
        marginBottom: 4,
        marginRight: 4,
    },

    // Availability section
    availabilitySection: {
        marginTop: 32, // mt-8
        paddingTop: 24, // pt-6
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', // border-gray-200
    },
    availabilityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12, // px-3
        paddingVertical: 8, // py-2
        borderRadius: 3, // rounded
        fontSize: 14, // text-sm
        fontWeight: 'medium',
    },
    availableStyle: {
        backgroundColor: '#dcfce7', // bg-green-100
        color: '#166534', // text-green-800
    },
    unavailableStyle: {
        backgroundColor: '#fee2e2', // bg-red-100
        color: '#991b1b', // text-red-800
    },

    // Footer
    footer: {
        marginTop: 48, // mt-12
        paddingTop: 24, // pt-6
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', // border-gray-200
        textAlign: 'center',
        fontSize: 10, // text-xs
        color: '#6b7280', // text-gray-500
    },
});

interface CVPDFDocumentProps {
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

export const CVPDFDocument = ({ profileData, parsedData, options }: CVPDFDocumentProps) => {
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
        ? '******** ' + profileData.full_name.trim().split(' ').pop()
        : profileData.full_name;

    const getAvailabilityText = () => {
        if (profileData.professional_profile?.available) {
            return 'Available Now';
        }
        if (profileData.professional_profile?.availablefrom) {
            return `Available from ${new Date(profileData.professional_profile.availablefrom).toLocaleDateString()}`;
        }
        return 'Currently Unavailable';
    };

    const getAvailabilityStyle = () => {
        return profileData.professional_profile?.available ? styles.availableStyle : styles.unavailableStyle;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{displayName}</Text>

                        <View style={styles.contactInfoContainer}>
                            <View style={styles.contactInfoRow}>

                                {profileData.email && (
                                    <View>
                                        <Text style={styles.contactLabel}>Email:</Text>
                                        <Text>{formatEmail(profileData.email)}</Text>
                                    </View>
                                )}
                                {profileData.phone && (
                                    <View>
                                        <Text style={styles.contactLabel}>Phone:</Text>
                                        <Text>{formatPhone(profileData.phone)}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.contactInfoRow}>
                                {profileData.professional_profile?.city && (
                                    <View>
                                        <Text style={styles.contactLabel}>Location:</Text>
                                        <Text>{profileData.professional_profile.city}</Text>
                                    </View>
                                )}
                                {profileData.age && (
                                    <View>
                                        <Text style={styles.contactLabel}>Age:</Text>
                                        <Text>{profileData.age} years old</Text>
                                    </View>
                                )}
                                {profileData.professional_profile?.daily_wage_net && (
                                    <View>
                                        <Text style={styles.contactLabel}>Daily Rate:</Text>
                                        <Text>{formatWage(profileData.professional_profile.daily_wage_net)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Logo */}
                    {options.logo && (
                        <View style={styles.headerRight}>
                            <Image src={options.logo} style={styles.logo} />
                        </View>
                    )}
                </View>

                {/* Professional Summary */}
                {experienceSummary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summaryText}>{experienceSummary}</Text>
                    </View>
                )}

                {/* Skills Section */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                        <View style={styles.skillsGrid}>
                            <View style={styles.skillsColumn}>
                                {skills.filter((_, index) => index % 2 === 0).map((skill, index) => {
                                    const skillMatch = typeof skill === 'string' ? skill.match(/^(.+?)\s*\((.+?)\)$/) : null;
                                    const skillName = skillMatch ? skillMatch[1] : skill;
                                    const skillLevel = skillMatch ? skillMatch[2] : 'intermediate';

                                    return (
                                        <View key={`skill-${skillName}-${index * 2}`} style={styles.skillRow}>
                                            <Text style={styles.skillName}>{skillName}</Text>
                                            <Text style={styles.skillLevel}>{skillLevel}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <View style={styles.skillsColumn}>
                                {skills.filter((_, index) => index % 2 === 1).map((skill, index) => {
                                    const skillMatch = typeof skill === 'string' ? skill.match(/^(.+?)\s*\((.+?)\)$/) : null;
                                    const skillName = skillMatch ? skillMatch[1] : skill;
                                    const skillLevel = skillMatch ? skillMatch[2] : 'intermediate';

                                    return (
                                        <View key={`skill-${skillName}-${index * 2 + 1}`} style={styles.skillRow}>
                                            <Text style={styles.skillName}>{skillName}</Text>
                                            <Text style={styles.skillLevel}>{skillLevel}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {/* Languages & Technologies */}
                {(languages.length > 0 || technologies.length > 0) && (
                    <View style={styles.twoColumnGrid}>
                        {/* Languages */}
                        {languages.length > 0 && (
                            <View style={styles.leftColumn}>
                                <Text style={styles.sectionTitle}>Languages</Text>
                                <View style={styles.languageContainer}>
                                    {languages.map((language, index) => {
                                        const langMatch = typeof language === 'string' ? language.match(/^(.+?)\s*\((.+?)\)$/) : null;
                                        const langName = langMatch ? langMatch[1] : language;
                                        const langLevel = langMatch ? langMatch[2] : 'intermediate';

                                        return (
                                            <View key={`lang-${langName}-${index}`} style={styles.languageRow}>
                                                <Text style={styles.languageName}>{langName}</Text>
                                                <Text style={styles.languageLevel}>{langLevel}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Technologies */}
                        {technologies.length > 0 && (
                            <View style={styles.rightColumn}>
                                <Text style={styles.sectionTitle}>Technologies & Tools</Text>
                                <View style={styles.technologiesContainer}>
                                    {technologies.map((tech, index) => (
                                        <Text key={`tech-${tech}-${index}`} style={styles.technologyTag}>
                                            {tech}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Work Experience */}
                {workExperiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        <View style={styles.experienceContainer}>
                            {workExperiences.map((exp, index) => (
                                <View key={`exp-${exp.position}-${exp.company}-${index}`} style={styles.experienceItem}>
                                    <View style={styles.experienceDot}></View>
                                    <View style={styles.experienceHeader}>
                                        <Text style={styles.experienceTitle}>{exp.position}</Text>
                                        <View style={styles.experienceCompanyRow}>
                                            <Text style={styles.experienceCompany}>{exp.company}</Text>
                                            <Text style={styles.experienceDuration}>{exp.duration}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.experienceDescription}>{exp.description}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}



                

                                {/* Education */}
                {educations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        <View style={styles.educationContainer}>
                            {educations.map((edu, index) => (
                                <View key={`edu-${edu.degree}-${edu.school}-${index}`} style={styles.educationItem}>
                                    <View style={styles.educationDot}></View>
                                    <View style={styles.educationHeader}>
                                        <View style={styles.educationLeft}>
                                            <Text style={styles.educationTitle}>{edu.degree}</Text>
                                            <Text style={styles.educationSchool}>{edu.school}</Text>
                                        </View>
                                        <Text style={styles.experienceDuration}>{edu.duration}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    CV generated on {new Date().toLocaleDateString()}
                </Text>
            </Page>
        </Document>
    );
};