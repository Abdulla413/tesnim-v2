import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const getAIWordData = async (word: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Using the JSON-mode optimized model
      messages: [
        {
          role: "system",
          content: "You are a professional German-Uyghur lexicographer. Return ONLY a JSON object."
        },
        {
          role: "user",
          content: `Analyze the German word "${word}". 
          Required JSON structure:
          {
            "deutsch": "${word}",
            "wortart": "Noun/Verb/Adjective",
            "level": "A1-C2",
            "artikel": "der/die/das or null",
            "plural": "plural form or null",
            "stammformen": "e.g., läuft, lief, ist gelaufen (for verbs)",
            "definition_de": "simple German definition",
            "definition_ug": "simple Uyghur definition",
            "umschrift": "ULY (Latin Uyghur script)",
            "bedeutungen": [
              {"id": 1, "de": "meaning 1", "ug": "تەرجىمە 1", "beispiel_de": "German sentence", "beispiel_ug": "Uyghur sentence"}
            ]
          }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return null;
  }
};