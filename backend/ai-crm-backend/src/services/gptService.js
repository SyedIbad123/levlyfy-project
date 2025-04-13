const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeCall = async (transcript) => {
  try {
    const prompt = `
You are a CRM performance coach AI. Given the following call transcript:

"${transcript}"

Return the following as a JSON object:
- sentiment: (Positive, Negative, Neutral)
- feedback: (2-3 sentences personalized feedback for the agent)
- summary: (a brief summary of what happened)
- score: (a number between 0 and 100 based on how well the agent handled the call)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    // Parse the JSON output
    const analysis = JSON.parse(content);

    return analysis;
  } catch (error) {
    console.error("GPT analysis error:", error);
    throw error;
  }
};

module.exports = { analyzeCall };
