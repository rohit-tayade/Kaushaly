// NOTE: Never hardcode API keys here. Put your key in a local `.env` file:
//   VITE_GEMINI_API_KEY=your_key_here
// and make sure `.env` is listed in `.gitignore`.
export const DEFAULT_GEMINI_KEY: string = import.meta.env.VITE_GEMINI_API_KEY || '';

const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-1.5-flash'];

export interface ResumeAnalysisResult {
  overallScore: number;
  atsCompatibility: 'High' | 'Medium' | 'Low';
  sections: {
    name: string;
    score: number;
    atsFriendly: boolean;
    content: string;
    issues: string[];
    recommendations: string[];
  }[];
  keywords: {
    found: string[];
    missing: string[];
    industryRelevant: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  extractedSkills: string[];
  summary: string;
  raw?: string;
}

export interface SkillGapResult {
  targetRoleAnalysis: {
    title: string;
    description: string;
    averageSalary: string;
    demandLevel: 'High' | 'Medium' | 'Low';
  };
  skillComparison: {
    skill: string;
    category: 'Technical' | 'Soft' | 'Domain';
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  missingSkills: {
    skill: string;
    importance: 'Critical' | 'High' | 'Medium' | 'Low';
    timeToLearn: string;
    learningResources: string[];
  }[];
  strengths: string[];
  learningRoadmap: {
    phase1: {
      title: string;
      duration: string;
      focus: string[];
      milestones: string[];
    };
    phase2: {
      title: string;
      duration: string;
      focus: string[];
      milestones: string[];
    };
    phase3: {
      title: string;
      duration: string;
      focus: string[];
      milestones: string[];
    };
  };
  overallReadiness: number;
  estimatedTimeToReady: string;
}

export function extractSectionsFromText(text: string): { sectionName: string; content: string }[] {
  const sectionPatterns = [
    { pattern: /(?:^|\n)\s*(SUMMARY|PROFESSIONAL\s*SUMMARY|OBJECTIVE|CAREER\s*OBJECTIVE|PROFILE)\s*[:\-]?\s*\n/gi, name: 'Summary' },
    { pattern: /(?:^|\n)\s*(EXPERIENCE|WORK\s*EXPERIENCE|PROFESSIONAL\s*EXPERIENCE|EMPLOYMENT\s*HISTORY|WORK\s*HISTORY)\s*[:\-]?\s*\n/gi, name: 'Experience' },
    { pattern: /(?:^|\n)\s*(EDUCATION|ACADEMIC\s*BACKGROUND|QUALIFICATIONS|ACADEMIC\s*QUALIFICATIONS)\s*[:\-]?\s*\n/gi, name: 'Education' },
    { pattern: /(?:^|\n)\s*(SKILLS|TECHNICAL\s*SKILLS|CORE\s*SKILLS|KEY\s*SKILLS|COMPETENCIES|CORE\s*COMPETENCIES)\s*[:\-]?\s*\n/gi, name: 'Skills' },
    { pattern: /(?:^|\n)\s*(PROJECTS|KEY\s*PROJECTS|PERSONAL\s*PROJECTS|ACADEMIC\s*PROJECTS)\s*[:\-]?\s*\n/gi, name: 'Projects' },
    { pattern: /(?:^|\n)\s*(CERTIFICATIONS?|LICENSES?|CREDENTIALS?|PROFESSIONAL\s*CERTIFICATIONS?)\s*[:\-]?\s*\n/gi, name: 'Certifications' },
    { pattern: /(?:^|\n)\s*(ACHIEVEMENTS?|ACCOMPLISHMENTS?|AWARDS?|HONORS?)\s*[:\-]?\s*\n/gi, name: 'Achievements' },
    { pattern: /(?:^|\n)\s*(LANGUAGES?|LANGUAGE\s*SKILLS?)\s*[:\-]?\s*\n/gi, name: 'Languages' },
    { pattern: /(?:^|\n)\s*(INTERESTS?|HOBBIES?|ACTIVITIES?|EXTRACURRICULAR)\s*[:\-]?\s*\n/gi, name: 'Interests' },
    { pattern: /(?:^|\n)\s*(REFERENCES?)\s*[:\-]?\s*\n/gi, name: 'References' },
    { pattern: /(?:^|\n)\s*(CONTACT|CONTACT\s*INFORMATION|PERSONAL\s*DETAILS?|PERSONAL\s*INFORMATION)\s*[:\-]?\s*\n/gi, name: 'Contact Information' },
  ];

  const sections: { sectionName: string; content: string; startIndex: number }[] = [];

  for (const { pattern, name } of sectionPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      sections.push({
        sectionName: name,
        content: '',
        startIndex: match.index + match[0].length,
      });
    }
  }

  sections.sort((a, b) => a.startIndex - b.startIndex);

  for (let i = 0; i < sections.length; i++) {
    const startIdx = sections[i].startIndex;
    const endIdx = i < sections.length - 1 ? sections[i + 1].startIndex - 50 : text.length;
    sections[i].content = text.slice(startIdx, endIdx).trim();
  }

  if (sections.length === 0) {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length > 0) {
      sections.push({
        sectionName: 'Summary',
        content: lines.slice(0, Math.min(10, lines.length)).join('\n'),
        startIndex: 0,
      });
    }
  }

  return sections.map(({ sectionName, content }) => ({ sectionName, content }));
}

export function extractSkillsFromResume(text: string, sections: { sectionName: string; content: string }[]): string[] {
  const skills: Set<string> = new Set();

  const skillsSection = sections.find((s) => s.sectionName === 'Skills');
  if (skillsSection) {
    const skillItems = skillsSection.content.split(/[,;•|\n]/);
    skillItems.forEach((skill) => {
      const cleaned = skill.trim().replace(/[•\-\*]/g, '').trim();
      if (cleaned && cleaned.length > 1 && cleaned.length < 50) {
        skills.add(cleaned);
      }
    });
  }

  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'DynamoDB',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
    'Agile', 'Scrum', 'JIRA', 'Confluence', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking',
    'Data Analysis', 'Excel', 'Power BI', 'Tableau', 'R', 'MATLAB',
    'REST API', 'GraphQL', 'Microservices', 'DevOps', 'CI/CD',
    'Figma', 'Adobe XD', 'UI/UX', 'Photoshop', 'Illustrator',
  ];

  const lowerText = text.toLowerCase();
  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

function cleanJson(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return text.trim();
}

export async function callGemini(
  prompt: string,
  apiKey?: string,
  systemInstruction?: string,
  temperature = 0.4,
  maxTokens = 2500
): Promise<string> {
  const key = (apiKey && apiKey.trim()) || DEFAULT_GEMINI_KEY;

  if (!key) {
    throw new Error(
      'Gemini API key is required. Please set VITE_GEMINI_API_KEY in your .env file or add it in your Dashboard.'
    );
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        key
      )}`;

      const bodyPayload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        if (response.status === 404 || data.error?.code === 404) {
          lastError = new Error(data.error?.message || `Model ${model} not available`);
          continue;
        }
        throw new Error(data.error?.message || `Gemini API error (${response.status})`);
      }

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      if (text !== undefined) {
        return text;
      }

      throw new Error('Empty response received from Gemini.');
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response with Gemini models.');
}

export async function analyzeResumeWithGemini(
  resumeText: string,
  apiKey?: string
): Promise<ResumeAnalysisResult> {
  const extractedSections = extractSectionsFromText(resumeText);
  const extractedSkills = extractSkillsFromResume(resumeText, extractedSections);

  const formattedSections =
    extractedSections.length > 0
      ? extractedSections.map((s) => `## ${s.sectionName}\n${s.content}`).join('\n\n')
      : resumeText;

  const systemInstruction = `You are an expert ATS (Applicant Tracking System) resume analyst and career coach. Analyze resumes section by section and provide detailed, actionable feedback.
We have detected these preliminary sections:
${extractedSections.map((s) => `- ${s.sectionName}`).join('\n')}
And detected skills:
${extractedSkills.join(', ')}

Return your entire output as ONLY a valid JSON object matching this schema:
{
  "overallScore": 82,
  "atsCompatibility": "High",
  "sections": [
    {
      "name": "section name",
      "score": 8,
      "atsFriendly": true,
      "content": "brief summary",
      "issues": ["issue 1"],
      "recommendations": ["recommendation 1"]
    }
  ],
  "keywords": {
    "found": ["keyword1"],
    "missing": ["suggested keyword 1"],
    "industryRelevant": ["relevant keyword"]
  },
  "formatting": {
    "score": 8,
    "issues": ["formatting issue"],
    "suggestions": ["formatting suggestion"]
  },
  "extractedSkills": ${JSON.stringify(extractedSkills)},
  "summary": "Overall summary of the resume"
}`;

  const prompt = `Please analyze this resume and provide detailed section-by-section feedback:\n\n${formattedSections}`;

  const rawText = await callGemini(prompt, apiKey, systemInstruction, 0.2, 2500);

  try {
    const cleaned = cleanJson(rawText);
    const parsed = JSON.parse(cleaned);
    if (!parsed.extractedSkills || parsed.extractedSkills.length === 0) {
      parsed.extractedSkills = extractedSkills;
    }
    return parsed;
  } catch (e) {
    return {
      overallScore: 75,
      atsCompatibility: 'Medium',
      sections: extractedSections.map((s) => ({
        name: s.sectionName,
        score: 7,
        atsFriendly: true,
        content: s.content.slice(0, 150) + '...',
        issues: [],
        recommendations: ['Enhance with quantified impact and role-specific keywords.'],
      })),
      keywords: {
        found: extractedSkills.slice(0, 5),
        missing: ['System Architecture', 'CI/CD', 'Automated Testing'],
        industryRelevant: ['Leadership', 'Collaboration', 'Problem Solving'],
      },
      formatting: {
        score: 8,
        issues: [],
        suggestions: ['Maintain simple single-column layout for ATS parser readability.'],
      },
      extractedSkills,
      summary: rawText,
      raw: rawText,
    };
  }
}

export async function analyzeSkillGapWithGemini(
  currentSkills: string[],
  targetRole: string,
  apiKey?: string
): Promise<SkillGapResult> {
  const systemInstruction = `You are a career development expert who analyzes skill gaps between a person's current abilities and their target role. Provide detailed, actionable analysis.
Return your output as ONLY a valid JSON object with this exact structure:
{
  "targetRoleAnalysis": {
    "title": "string",
    "description": "Brief description of the role",
    "averageSalary": "$120,000 - $150,000",
    "demandLevel": "High"
  },
  "skillComparison": [
    {
      "skill": "skill name",
      "category": "Technical",
      "currentLevel": 70,
      "requiredLevel": 90,
      "gap": 20,
      "priority": "High"
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "Critical",
      "timeToLearn": "2-3 months",
      "learningResources": ["Coursera course", "Official documentation"]
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "learningRoadmap": {
    "phase1": {
      "title": "Foundation",
      "duration": "Month 1",
      "focus": ["skill 1", "skill 2"],
      "milestones": ["milestone 1"]
    },
    "phase2": {
      "title": "Intermediate",
      "duration": "Month 2-3",
      "focus": ["skill 3", "skill 4"],
      "milestones": ["milestone 2"]
    },
    "phase3": {
      "title": "Advanced",
      "duration": "Month 4+",
      "focus": ["skill 5"],
      "milestones": ["milestone 3"]
    }
  },
  "overallReadiness": 72,
  "estimatedTimeToReady": "3-6 months"
}`;

  const prompt = `Analyze the skill gap for someone with these current skills: ${currentSkills.join(', ')}

Their target role is: ${targetRole}

Provide a comprehensive skill gap analysis with a personalized learning roadmap.`;

  const rawText = await callGemini(prompt, apiKey, systemInstruction, 0.3, 2500);
  const cleaned = cleanJson(rawText);
  return JSON.parse(cleaned);
}

export async function generateResumeSectionWithGemini(
  section: string,
  userInput: string,
  existingContent?: string,
  apiKey?: string
): Promise<string> {
  const sectionPrompts: Record<string, string> = {
    summary:
      'Write a professional summary/objective for a resume. 2-3 sentences highlighting key strengths and career goals. ATS-friendly with relevant keywords.',
    experience:
      'Write professional work experience entries for a resume with company name, job title, dates, location, and 3-5 bullet points with quantifiable achievements.',
    education:
      'Write education entries with institution name, degree, field of study, graduation date, relevant coursework, and honors.',
    skills:
      'Create a categorized skills section (Technical Skills, Soft Skills, Tools/Technologies, Languages).',
    projects:
      'Write project entries with project name, technologies used, brief description, and measurable outcomes.',
    certifications:
      'List certifications with name, issuing organization, and completion date.',
  };

  const systemInstruction = `You are an expert resume writer specializing in ATS-optimized resumes. ${
    sectionPrompts[section] || 'Help create professional resume content.'
  }
Use clear, professional language, industry-relevant keywords, and return clean text formatted for a resume.`;

  const prompt = existingContent
    ? `Based on the following information, generate an improved ${section} section for a resume:\n\nExisting content:\n${existingContent}\n\nUser input/requirements:\n${userInput}`
    : `Generate a ${section} section for a resume based on this information:\n\n${userInput}`;

  return await callGemini(prompt, apiKey, systemInstruction, 0.6, 1200);
}

export async function generateCoverLetterWithGemini(
  params: {
    resumeData: any;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  },
  apiKey?: string
): Promise<string> {
  const systemInstruction = `You are an expert cover letter writer who creates compelling, personalized cover letters that help candidates stand out.
Key principles:
1. Match tone to the company culture
2. Highlight relevant experience and achievements
3. Show genuine enthusiasm for the role
4. 3-4 concise paragraphs with strong call-to-action closing`;

  const prompt = `Write a professional cover letter for this job application:
Company: ${params.companyName}
Position: ${params.jobTitle}

Job Description:
${params.jobDescription}

Candidate's Background:
${typeof params.resumeData === 'string' ? params.resumeData : JSON.stringify(params.resumeData, null, 2)}`;

  return await callGemini(prompt, apiKey, systemInstruction, 0.7, 1200);
}

export async function resourceChatWithGemini(
  params: {
    message: string;
    skills?: string[];
    conversationHistory?: { role: string; content: string }[];
  },
  apiKey?: string
): Promise<string> {
  const historyText = (params.conversationHistory || [])
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const systemInstruction = `You are a career development assistant that helps users find learning resources and improve their skills.
${
  params.skills && params.skills.length > 0
    ? `The user has these skills: ${params.skills.join(', ')}. Tailor recommendations accordingly.`
    : ''
}
Provide actionable recommendations including specific courses, free tutorials, certifications, practical projects, and clear next steps.`;

  const prompt = historyText
    ? `${historyText}\n\nUser: ${params.message}\nAssistant:`
    : params.message;

  return await callGemini(prompt, apiKey, systemInstruction, 0.7, 1500);
}