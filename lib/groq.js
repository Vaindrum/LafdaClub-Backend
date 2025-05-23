import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function simulateFight({prompt, announcer}){
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: `You're a fight announcer bot called ${announcer.name} and your description is: ${announcer.description}. Your voice style is ${announcer.voiceStyle}` },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};
