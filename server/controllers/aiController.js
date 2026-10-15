require('dotenv').config();

// Controller for AI-powered features using Groq API
const generateFollowUpMessage = async (req, res, next) => {
  try {
    const { company, role, status } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: 'Company and role are required' });
    }

    const currentStatus = status || 'Applied';
    const userName = req.user?.name || 'Applicant';

    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

    // If GROQ_API_KEY is configured in .env, call Groq API
    if (apiKey) {
      try {
        const prompt = `Write a short, polite, professional follow-up email from a student/intern candidate named "${userName}" to the hiring team at "${company}" regarding the "${role}" internship. 
The current application status is "${currentStatus}". 
Guidelines:
- Keep it concise (under 120 words).
- Tailor tone to the status (e.g. if Applied: polite check-in; if Interview: thank you / next steps; if Offer: expressing excitement and gratitude; if Rejected: polite appreciation and staying connected for future opportunities).
- Include a clear Subject line at the beginning.
- End with a professional sign-off with the candidate's name (${userName}).`;

        const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert career coach helping students write polite, impactful, and concise internship follow-up emails.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 350
          })
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const draft = data.choices?.[0]?.message?.content?.trim();
          if (draft) {
            return res.status(200).json({ message: draft });
          }
        } else {
          const rawError = await groqResponse.text();
          let errorMessage = rawError;
          try {
            const parsed = JSON.parse(rawError);
            if (parsed.error?.message) {
              errorMessage = parsed.error.message;
            }
          } catch (_) {
            // Use rawError if JSON parsing fails
          }
          console.error(`Groq API request failed [Status ${groqResponse.status}]: ${errorMessage}`);
        }
      } catch (apiErr) {
        console.error(`Groq API request exception: ${apiErr.message}`);
      }
    } else {
      console.warn('Groq API skipped: process.env.GROQ_API_KEY is not defined or is empty.');
    }

    // High quality contextual fallback template when GROQ_API_KEY is not yet supplied
    let fallbackDraft = '';
    if (currentStatus === 'Interview') {
      fallbackDraft = `Subject: Thank You & Follow-Up: ${role} Interview - ${userName}

Dear ${company} Recruiting Team,

Thank you for taking the time to speak with me regarding the ${role} position. I really enjoyed our conversation and learning more about the team's upcoming initiatives.

Our discussion reinforced my enthusiasm for the role and confirmed that my skills and passion align well with ${company}'s goals. 

Please let me know if there are any additional materials or details I can provide as you evaluate candidates. I look forward to hearing about the next steps.

Best regards,
${userName}`;
    } else if (currentStatus === 'Offer') {
      fallbackDraft = `Subject: Excitement Regarding Offer: ${role} - ${userName}

Dear ${company} Team,

Thank you so much for extending an offer for the ${role} position! I am thrilled about this opportunity to contribute to ${company}.

I am currently reviewing the details of the offer letter. Could we schedule a quick call to discuss the start date, team placement, and onboarding process?

Thank you again for your confidence in my abilities.

Warm regards,
${userName}`;
    } else if (currentStatus === 'Rejected') {
      fallbackDraft = `Subject: Thank You for the Update: ${role} - ${userName}

Dear ${company} Recruiting Team,

Thank you for informing me of your decision regarding the ${role} position. While I am disappointed not to be moving forward at this time, I appreciate the time and consideration given to my application.

I have great respect for ${company}'s mission and would welcome the chance to be considered for future opportunities that align with my background.

Wishing you and the team continued success.

Sincerely,
${userName}`;
    } else {
      // Default: Applied
      fallbackDraft = `Subject: Inquiring on Application Status: ${role} - ${userName}

Dear Hiring Team at ${company},

I hope this email finds you well. 

I recently submitted my application for the ${role} position and wanted to reaffirm my strong enthusiasm for this opportunity with ${company}. 

Given my background and passion for the work your team is doing, I am eager to contribute to your upcoming projects. Could you kindly let me know if there are any updates regarding the interview timeline or if you need any additional information from my side?

Thank you very much for your time and consideration.

Best regards,
${userName}`;
    }

    return res.status(200).json({ message: fallbackDraft });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateFollowUpMessage };
