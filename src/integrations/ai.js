
export async function aiAssist(prompt){
  // Stubbed AI response; integrate OpenAI/other provider via process.env.OPENAI_API_KEY
  return `🤖 AI Assist: For "${prompt}", try offering eco-wash at 10% discount this week.`;
}
export async function predictBusiness(storeId){
  // naive prediction: last 30 days income * 1.05
  return { storeId, forecastNext30Days: 1.05 };
}
