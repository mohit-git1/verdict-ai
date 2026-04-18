require('dotenv').config();
const { generateQuestionPaper } = require('./src/services/llm');
const { buildPrompt } = require('./src/services/promptBuilder');
const mongoose = require('mongoose');

async function test() {
  const prompt = buildPrompt({
    subject: "React Developer",
    dueDate: new Date().toISOString(),
    questionTypes: [{ type: "mcq", numQuestions: 1, marks: 5 }],
    additionalInstructions: "Senior level"
  });
  console.log("PROMPT:");
  console.log(prompt);
  
  try {
    const paper = await generateQuestionPaper(prompt, (msg) => console.log('PROGRESS:', msg));
    console.log("PAPER:", JSON.stringify(paper, null, 2));
  } catch(e) {
    console.log("CATCH:", e.message);
  }
  process.exit(0);
}
test();
