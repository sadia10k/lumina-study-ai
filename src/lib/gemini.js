export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Robust Fetch wrapper to catch 503 internal timeouts and fallback to stable flash
const fetchWithFallback = async (modelName, payload) => {
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
  
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.status === 503) {
    console.warn(`[Lumina] Model ${modelName} returned 503 Overloaded. Falling back to gemini-2.5-flash...`);
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const jsonString = data.candidates[0].content.parts[0].text;
  
  // Chat might not return JSON, so we tentatively parse, or return raw string if it throws
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return jsonString;
  }
};

export const generateStudyNotes = async (text) => {
  const payload = {
    contents: [{ parts: [{ text: `You are an expert academic assistant. Extract highly organized, readable study notes from the following lecture text.\n\nLecture Text: ${text}` }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          summary: { type: "STRING" },
          topics: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                takeaway: { type: "STRING" },
                details: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: { name: { type: "STRING" }, description: { type: "ARRAY", items: { type: "STRING" } } },
                    required: ["name", "description"]
                  }
                }
              },
              required: ["title", "details"]
            }
          }
        },
        required: ["title", "summary", "topics"]
      }
    }
  };
  return await fetchWithFallback('gemini-flash-latest', payload);
};

export const generateFlashcards = async (text) => {
  const payload = {
    contents: [{ parts: [{ text: `You are an expert tutor. Extract a robust array of core vocabulary flashcards from the lecture text.\n\nLecture Text: ${text}` }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          vocabulary: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: { term: { type: "STRING" }, definition: { type: "STRING" } },
              required: ["term", "definition"]
            }
          }
        },
        required: ["vocabulary"]
      }
    }
  };
  return await fetchWithFallback('gemini-flash-latest', payload);
};

export const generateActiveRecallQuiz = async (text, numQuestions = 5, previousQuestions = []) => {
  let promptText = `You are an expert tutor. Generate exactly ${numQuestions} tricky multiple choice questions to test the student's active recall.\n\nLecture Text: ${text}`;
  
  if (previousQuestions && previousQuestions.length > 0) {
    const prevList = previousQuestions.map(q => `- ${q.question}`).join('\n');
    promptText += `\n\nCRITICAL CONSTRAINT: Do NOT generate questions that are similar or identical to the following previously asked questions. You must come up with entirely new aspects of the text to test:\n${prevList}`;
  }

  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            correctAnswerIndex: { type: "INTEGER" },
            explanation: { type: "STRING" }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  };
  return await fetchWithFallback('gemini-flash-latest', payload);
};

export const chatWithContext = async (contextText, userMessage) => {
  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: `System Context constraints: You are a grounded AI study assistant. Use the following context to answer precisely. Format with markdown lists or bolding if it improves readability.\n\nContext Document:\n${contextText}\n\nStudent Question:\n${userMessage}` }]
    }],
    generationConfig: { temperature: 0.3 }
  };
  return await fetchWithFallback('gemini-flash-latest', payload);
};
