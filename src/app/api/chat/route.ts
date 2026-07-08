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

    // Default contexts
    let financeSummary = "Revenue: ₹1.24 Cr, Profit: ₹38.5 L, Cash Flow: ₹52.1 L";
    let lowStockAlerts = "Matrix Semi HK (procurement delayed), Fiber Optic Switch (12 in stock, min 20)";
    let recentSales = "MalhotraTech (₹1.5L), Stellar Brands (₹4.2L)";
    let employeeList = "John Doe (Developer), Sarah Connor (SysOps)";
    let customerList = "Vikram Malhotra (LTV ₹4.8L), Stellar Brands (LTV ₹8.2L)";
    let fullInventory = "Premium Micro-Controller Chipset (0 stock), Solid State Drive (4 stock)";

    // Core KPIs default values matching main dashboard
    let revScore = 92;
    let profScore = 87;
    let cashScore = 90;
    let invScore = 72;
    let custScore = 81;
    let empScore = 89;

    try {
      if (db) {
        // 1. Fetch Finance
        const finSnap = await getDocs(collection(db, "finance"));
        if (!finSnap.empty) {
          const fin = finSnap.docs[finSnap.docs.length - 1].data();
          financeSummary = `Revenue: ₹${Number(fin.revenue || 0).toLocaleString()}, Profit: ₹${Number(fin.profit || 0).toLocaleString()}, Expenses: ₹${Number(fin.expenses || 0).toLocaleString()}`;
        }
        
        // 2. Fetch Inventory
        const invSnap = await getDocs(collection(db, "inventory"));
        if (!invSnap.empty) {
          const items = invSnap.docs.map(d => d.data());
          const lowStockCount = items.filter(item => item.status !== "In Stock").length;
          invScore = items.length > 0 ? Math.round(100 - (lowStockCount / items.length) * 100) : 100;
          
          const lowStock = items
            .filter(i => i.status !== "In Stock")
            .map(i => `${i.name} (${i.stock} units, status: ${i.status})`);
          if (lowStock.length > 0) lowStockAlerts = lowStock.join(", ");

          fullInventory = items
            .map(i => `${i.name} (Stock: ${i.stock}, Supplier: ${i.supplier || "N/A"}, Status: ${i.status})`)
            .join("\n");
        }

        // 3. Fetch Customers
        const custSnap = await getDocs(collection(db, "customers"));
        if (!custSnap.empty) {
          const customers = custSnap.docs.map(d => d.data());
          const avgChurn = customers.reduce((sum, c) => sum + (c.churnRisk || 0), 0) / customers.length;
          custScore = Math.round(100 - (avgChurn * 0.4));
          
          customerList = customers
            .map(c => `Customer Name: ${c.name}, Email: ${c.email}, LTV: ₹${Number(c.ltv || 0).toLocaleString()}, Churn Risk: ${c.churnRisk || 0}%`)
            .join("\n");
        }

        // 4. Fetch Employees (Staff)
        const empSnap = await getDocs(collection(db, "employees"));
        if (!empSnap.empty) {
          const employees = empSnap.docs.map(d => d.data());
          const avgProd = employees.reduce((sum, e) => sum + (e.productivity || 0), 0) / employees.length;
          empScore = Math.round(avgProd);

          employeeList = employees
            .map(e => `Employee Name: ${e.name}, Role: ${e.role || "Operator"}, Department: ${e.department || "General"}, Productivity: ${e.productivity || 0}%`)
            .join("\n");
        }

        // 5. Fetch manual sales & invoices override logs
        const salesSnap = await getDocs(collection(db, "sales"));
        if (!salesSnap.empty) {
          const salesLogs = salesSnap.docs.map(d => d.data());
          recentSales = salesLogs
            .map(s => `ID: ${s.id}, Customer: ${s.customer}, Item: ${s.item}, Amount: ₹${Number(s.amount || 0).toLocaleString()}, Status: ${s.status}`)
            .join("\n");
        }
      }
    } catch (dbErr) {
      console.error("Firestore read inside API route failed:", dbErr);
    }

    // Mathematically average the KPIs matching layout.tsx logic
    const healthScore = Math.round((revScore + profScore + cashScore + invScore + custScore + empScore) / 6);

    const systemPrompt = `You are the TwinIQ Business Intelligence Copilot. You are an expert business analyst and operational assistant.
You have access to the complete digital twin state of the business database:

[FINANCE PARAMETERS]
- Current Financials: ${financeSummary}
- System-Calculated Business Health Score: ${healthScore}%

[INVENTORY & STOCK LIST]
- Low Stock Alerts: ${lowStockAlerts}
- Full Inventory Directory:
${fullInventory}

[CLIENT & CRM DATA]
- Customer List:
${customerList}

[EMPLOYEES & STAFFING]
- Active Employees Directory:
${employeeList}

[SALES LEDGER OVERRIDES]
- Sales Logs:
${recentSales}

Guidelines:
1. You have complete visibility. If the user asks for employees list, customer details, low stock components, or sales metrics, you MUST read the data sections above and state the actual names and details correctly.
2. If the user asks about "business health", "health score", or "how is the business doing", you MUST explicitly state the "System-Calculated Business Health Score of ${healthScore}%" in your reply, and then explain the reasons based on the stock, sales, and employee data above.
3. Respond to the user's questions in a helpful, analytical, and professional assistant tone. Keep answers concise, actionable, and formatted in clear markdown.`;

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
