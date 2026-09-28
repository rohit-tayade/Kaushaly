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
    const { message, skills, conversationHistory, geminiKey, openAIKey } = await req.json();
    const apiKey = geminiKey || openAIKey || Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Please enter your Gemini API key in the dashboard to use AI features.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Resource chat request:', { message, skills });

    const systemInstruction = `You are a career development assistant that helps users find learning resources and improve their skills. You have knowledge about:
- Online learning platforms (Coursera, Udemy, edX, LinkedIn Learning, Pluralsight, etc.)
- Free resources (YouTube channels, documentation, blogs, podcasts)
- Certification programs
- Books and publications
- Community resources (GitHub, Stack Overflow, Discord communities)
- Industry trends and in-demand skills

${skills ? `The user has these skills: ${skills.join(', ')}. Tailor your recommendations to complement and enhance their existing skillset.` : ''}

When recommending resources:
1. Provide specific course/resource names with estimated time to complete
2. Include a mix of free and paid options
3. Suggest a learning path/order when relevant
4. Include practical projects or ways to apply the learning
5. Mention any prerequisites
6. Format your response clearly with sections and bullet points`;

    const historyText = (conversationHistory || [])
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const prompt = historyText
      ? `${historyText}\n\nUser: ${message}\nAssistant:`
      : message;

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
          maxOutputTokens: 2000,
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

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in resource-chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
