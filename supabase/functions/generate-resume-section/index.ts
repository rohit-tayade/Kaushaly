import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, userInput, existingContent, geminiKey, openAIKey } = await req.json();
    const apiKey = geminiKey || openAIKey || Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Please enter your Gemini API key in the dashboard to use AI features.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating resume section: ${section}`);

    const sectionPrompts: Record<string, string> = {
      summary: `Write a professional summary/objective for a resume. The summary should be 2-3 sentences, highlighting key strengths and career goals. Make it ATS-friendly with relevant keywords.`,
      experience: `Write professional work experience entries for a resume. Each entry should include: company name, job title, dates, location, and 3-5 bullet points with quantifiable achievements. Use action verbs and be specific.`,
      education: `Write education entries for a resume. Include: institution name, degree, field of study, graduation date, GPA (if above 3.0), relevant coursework, and honors/awards if applicable.`,
      skills: `Create a skills section for a resume. Organize skills into categories (Technical Skills, Soft Skills, Tools/Technologies, Languages, etc.). List the most relevant and in-demand skills first.`,
      projects: `Write project entries for a resume. Each project should include: project name, technologies used, brief description, and key achievements/impact. Focus on measurable outcomes.`,
      certifications: `List certifications and professional development for a resume. Include: certification name, issuing organization, date obtained, and expiration date if applicable.`,
    };

    const systemInstruction = `You are an expert resume writer specializing in ATS-optimized resumes. ${sectionPrompts[section] || 'Help create professional resume content.'}
            
Important guidelines:
- Use clear, professional language
- Include industry-relevant keywords
- Be specific and quantify achievements where possible
- Keep formatting simple for ATS compatibility
- Return the content as clean text that can be directly used in a resume`;

    const prompt = existingContent 
      ? `Based on the following information, generate an improved ${section} section for a resume:\n\nExisting content:\n${existingContent}\n\nUser input/requirements:\n${userInput}`
      : `Generate a ${section} section for a resume based on this information:\n\n${userInput}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    const data = await response.json();
    console.log('Gemini response received for section generation');

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-resume-section function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
