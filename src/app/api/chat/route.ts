import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini key not configured" }, { status: 400 });
    }

    // Fetch database metrics to feed to the LLM context
    let financeSummary = "Revenue: ₹1.24 Cr, Profit: ₹38.5 L, Cash Flow: ₹52.1 L";
    let lowStockAlerts = "Matrix Semi HK (procurement delayed), Fiber Optic Switch (12 in stock, min 20)";
    let recentSales = "MalhotraTech (₹1.5L), Stellar Brands (₹4.2L)";

    try {
      if (db) {
        const finSnap = await getDocs(collection(db, "finance"));
        if (!finSnap.empty) {
          const fin = finSnap.docs[finSnap.docs.length - 1].data();
          financeSummary = `Revenue: ₹${Number(fin.revenue || 0).toLocaleString()}, Profit: ₹${Number(fin.profit || 0).toLocaleString()}, Expenses: ₹${Number(fin.expenses || 0).toLocaleString()}`;
        }
        
        const invSnap = await getDocs(collection(db, "inventory"));
        if (!invSnap.empty) {
          const lowStock = invSnap.docs
            .map(d => d.data())
            .filter(i => i.status !== "In Stock")
            .map(i => `${i.name} (${i.stock} units, status: ${i.status})`);
          if (lowStock.length > 0) lowStockAlerts = lowStock.join(", ");
        }
      }
    } catch (dbErr) {
      console.error("Firestore read inside API route failed:", dbErr);
    }

    const systemPrompt = `You are the TwinIQ Business Intelligence Copilot. You are an expert business analyst and operational assistant.
You have access to the live digital twin state of the business:
- Current Financials: ${financeSummary}
- Active Supply Chain Bottlenecks/Low Stock: ${lowStockAlerts}
- Recent Sales Override Logs: ${recentSales}

Respond to the user's questions in a helpful, analytical, and professional assistant tone. Keep answers concise, actionable, and formatted in clear markdown. Mention specific numbers from the stats above when relevant.`;

    const userMessage = messages[messages.length - 1].content;

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
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
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
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to synthesize a prediction at this time.";

    return NextResponse.json({ reply: aiText });
  } catch (err: any) {
    console.error("Gemini Chat API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
