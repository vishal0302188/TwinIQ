import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customerName, messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini key not configured" }, { status: 400 });
    }

    const systemPrompt = `You are acting as the CTO or Operations Director of the customer company "${customerName}".
You are currently flagged as a "High Churn Risk" on the TwinIQ platform because your team has been experiencing server latency spikes, database lag, and pricing concerns.
You are chatting with a TwinIQ Customer Success representative.

Guidelines:
1. If the message list is empty, start the conversation by complaining about a specific operational issue (e.g. "We are seeing 200ms database lag on our Stripe integrations and we are considering leaving"). Keep it short.
2. Respond in character as the client. Keep your replies concise (under 2 sentences).
3. If the representative proposes a reasonable troubleshooting fix (e.g., tuning indexes, scaling cloud quotas, allocating memory, bypassing middleware, or providing custom discount pricing), gradually become cooperative.
4. Once they propose a good solution, you MUST agree to stay and resolve the issue. In your final message, you MUST explicitly include a phrase like: "Thank you, that solved our issue! We will continue our subscription with TwinIQ." to signal that the outreach succeeded.
5. If the representative just says hello or makes generic replies without proposing any operational or pricing solutions, remain skeptical and continue complaining about the latency or cost.`;

    // Map conversation logs to LLM format
    const formattedMessages = messages.map((msg: any) => {
      const roleName = msg.sender === "cs" ? "TwinIQ Support (User)" : `${customerName} CTO (You)`;
      return `${roleName}: ${msg.text}`;
    }).join("\n");

    const prompt = `${systemPrompt}\n\nConversation history:\n${formattedMessages}\n\nGenerate the next response in character:`;

    // Send REST call to Gemini 2.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error response:", errText);
      return NextResponse.json({ error: "Gemini API failure" }, { status: 500 });
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "We still have configuration lag. Can you look at this?";

    return NextResponse.json({ reply: aiText.trim() });
  } catch (err: any) {
    console.error("Outreach API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
