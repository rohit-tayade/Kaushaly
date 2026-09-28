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
    const { resumeData, jobTitle, companyName, jobDescription, geminiKey, openAIKey } = await req.json();
    const apiKey = geminiKey || openAIKey || Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Please enter your Gemini API key in the dashboard to use AI features.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Cover letter generation request:', { jobTitle, companyName });

    const systemInstruction = `You are an expert cover letter writer who creates compelling, personalized cover letters that help candidates stand out. 

Key principles:
1. Match the tone and style to the company culture
2. Highlight relevant experience and achievements from the resume
3. Show genuine interest in the company and role
4. Include specific examples that demonstrate qualifications
5. Keep it concise (3-4 paragraphs)
6. Use professional but engaging language
7. Address the key requirements from the job description
8. Include a strong opening and call-to-action closing`;

    const prompt = `Write a professional cover letter for this job application:

Company: ${companyName}
Position: ${jobTitle}

Job Description:
${jobDescription}

Candidate's Resume/Background:
${JSON.stringify(resumeData, null, 2)}

Create a compelling cover letter that connects the candidate's experience to the job requirements.`;

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

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coverLetter = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
