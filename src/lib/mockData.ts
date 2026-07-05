export interface KPI {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  score: number;
}

export interface BusinessNode {
  id: string;
  label: string;
  health: "green" | "yellow" | "red";
  score: number;
  description: string;
  x: number;
  y: number;
  details: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ltv: number;
  churnRisk: number;
  favProducts: string[];
  purchaseHistory: { date: string; amount: number; item: string }[];
  timeline: { date: string; event: string }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  demandForecast: number;
  supplier: string;
  supplierRisk: "low" | "medium" | "high";
  reorderQuantity: number;
  expiryDate?: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface FinanceRecord {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  performance: number;
  attendance: number;
  productivity: number;
}

export interface BusinessEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  category: "sales" | "inventory" | "finance" | "employee" | "supplier";
  severity: "info" | "warning" | "error";
}

// ----------------------------------------------------
// 1. ENTERPRISE SOFTWARE & IT PRESET (DEFAULT)
// ----------------------------------------------------
export const saasKPIs: KPI[] = [
  { name: "Revenue", value: "₹1.24 Cr", change: "+14.2% vs last month", isPositive: true, score: 92 },
  { name: "Profit", value: "₹38.5 L", change: "+8.4% vs last month", isPositive: true, score: 87 },
  { name: "Cash Flow", value: "₹52.1 L", change: "+11.5% vs last month", isPositive: true, score: 90 },
  { name: "Inventory Health", value: "92%", change: "-2.1% low stock risk", isPositive: false, score: 72 },
  { name: "Customer Satisfaction", value: "94.6%", change: "+0.8% support rating", isPositive: true, score: 95 },
  { name: "Staff Productivity", value: "89.2%", change: "+3.1% milestone completions", isPositive: true, score: 89 }
];

export const saasCustomers: Customer[] = [
  {
    id: "c1",
    name: "Vikram Malhotra",
    email: "vikram@malhotratech.com",
    avatar: "VM",
    ltv: 485000,
    churnRisk: 14,
    favProducts: ["SaaS Core Module", "Custom API Integrations"],
    purchaseHistory: [
      { date: "2026-06-15", amount: 150000, item: "SaaS Core Module" },
      { date: "2026-04-10", amount: 250000, item: "Custom API Integrations" }
    ],
    timeline: [
      { date: "2026-06-15", event: "Purchased SaaS Core Module Upgrade" },
      { date: "2026-05-20", event: "Support Ticket Resolved: API Latency" }
    ]
  },
  {
    id: "c2",
    name: "Ananya Sharma",
    email: "ananya@stellarbrands.in",
    avatar: "AS",
    ltv: 820000,
    churnRisk: 82,
    favProducts: ["Enterprise Dashboard", "Premium Compute Node"],
    purchaseHistory: [
      { date: "2026-05-18", amount: 420000, item: "Enterprise Dashboard" }
    ],
    timeline: [
      { date: "2026-06-28", event: "High inactivity (0 logins in 14 days)" }
    ]
  }
];

export const saasInventory: InventoryItem[] = [
  { id: "i1", name: "Product Alpha Server Node", stock: 145, minStock: 25, demandForecast: 18, supplier: "Titan Silicon Labs", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" },
  { id: "i2", name: "Fiber Optic Interface Switch", stock: 12, minStock: 20, demandForecast: 5, supplier: "Delhi Opto-Hardware", supplierRisk: "medium", reorderQuantity: 30, status: "Low Stock" },
  { id: "i3", name: "Solid State Drive Array 4TB", stock: 4, minStock: 15, demandForecast: 22, supplier: "SpeedData Suppliers", supplierRisk: "high", reorderQuantity: 25, status: "Low Stock" },
  { id: "i4", name: "Premium Micro-Controller Chipset", stock: 0, minStock: 50, demandForecast: 30, supplier: "Matrix Semi HK", supplierRisk: "high", reorderQuantity: 100, status: "Out of Stock" }
];

export const saasEmployees: Employee[] = [
  { id: "e1", name: "Kunal Dey", role: "VP Engineering", department: "Engineering", avatar: "KD", performance: 94, attendance: 98, productivity: 95 },
  { id: "e2", name: "Ritu Sengupta", role: "Head of Marketing", department: "Marketing", avatar: "RS", performance: 88, attendance: 95, productivity: 87 },
  { id: "e3", name: "Kabir Khan", role: "Inventory Lead", department: "Operations", avatar: "KK", performance: 82, attendance: 92, productivity: 81 },
  { id: "e4", name: "Pooja Hegde", role: "Finance Director", department: "Finance", avatar: "PH", performance: 96, attendance: 99, productivity: 97 }
];

export const saasFinance: FinanceRecord[] = [
  { month: "Jan", revenue: 8400000, expenses: 5800000, profit: 2600000, cashFlow: 4100000 },
  { month: "Feb", revenue: 9100000, expenses: 6100000, profit: 3000000, cashFlow: 4500000 },
  { month: "Mar", revenue: 10200000, expenses: 6800000, profit: 3400000, cashFlow: 4800000 },
  { month: "Apr", revenue: 11000000, expenses: 7200000, profit: 3800000, cashFlow: 4900000 },
  { month: "May", revenue: 11800000, expenses: 7600000, profit: 4200000, cashFlow: 5100000 },
  { month: "Jun", revenue: 12400000, expenses: 8550000, profit: 3850000, cashFlow: 5210000 }
];


// ----------------------------------------------------
// 2. FOOD SERVICE & RESTAURANT (SWIGGY, ZOMATO, DINE-IN)
// ----------------------------------------------------
export const foodKPIs: KPI[] = [
  { name: "Revenue", value: "₹4.85 L", change: "+18.5% vs last month", isPositive: true, score: 94 },
  { name: "Profit", value: "₹1.15 L", change: "+9.2% vs last month", isPositive: true, score: 85 },
  { name: "Cash Flow", value: "₹1.45 L", change: "+12.1% vs last month", isPositive: true, score: 88 },
  { name: "Inventory Health", value: "75%", change: "-5.0% stockouts flagged", isPositive: false, score: 75 },
  { name: "Customer Satisfaction", value: "91.2%", change: "+1.2% Swiggy rating", isPositive: true, score: 90 },
  { name: "Staff Productivity", value: "88.5%", change: "+4.1% prep velocity", isPositive: true, score: 88 }
];

export const foodCustomers: Customer[] = [
  {
    id: "fc1",
    name: "Ramesh Kumar (Regular)",
    email: "ramesh@gmail.com",
    avatar: "RK",
    ltv: 24500,
    churnRisk: 10,
    favProducts: ["Paneer Butter Masala", "Garlic Naan"],
    purchaseHistory: [
      { date: "2026-07-02", amount: 850, item: "Paneer Butter Masala Combo" }
    ],
    timeline: [
      { date: "2026-07-02", event: "Ordered 5 items via Dine-in Table 3" }
    ]
  },
  {
    id: "fc2",
    name: "Swiggy Order #3928 (Deliveries)",
    email: "swiggy_user_3928@gmail.com",
    avatar: "SW",
    ltv: 42000,
    churnRisk: 30,
    favProducts: ["Butter Chicken", "Rumali Roti"],
    purchaseHistory: [
      { date: "Today", amount: 480, item: "Butter Chicken Pack" }
    ],
    timeline: [
      { date: "Today", event: "Swiggy delivery agent picked up parcel" }
    ]
  }
];

export const foodInventory: InventoryItem[] = [
  { id: "fi1", name: "Amul Mozzarella Cheese (Blocks)", stock: 24, minStock: 10, demandForecast: 15, supplier: "Amul Dairy Margins", supplierRisk: "low", reorderQuantity: 15, status: "In Stock" },
  { id: "fi2", name: "Chicken Breast Fillets (Kgs)", stock: 2, minStock: 8, demandForecast: 25, supplier: "Local Poultry Farms", supplierRisk: "high", reorderQuantity: 10, status: "Low Stock" },
  { id: "fi3", name: "Whole Wheat Pizza Dough balls", stock: 120, minStock: 30, demandForecast: 10, supplier: "Wheat Bakery Source", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" },
  { id: "fi4", name: "Eco Takeaway Packaging Boxes", stock: 0, minStock: 100, demandForecast: 35, supplier: "EcoPack Printers", supplierRisk: "medium", reorderQuantity: 200, status: "Out of Stock" }
];

export const foodEmployees: Employee[] = [
  { id: "fe1", name: "Rahul Sharma", role: "Head Chef", department: "Kitchen Operations", avatar: "RS", performance: 92, attendance: 96, productivity: 94 },
  { id: "fe2", name: "Aditi Gowda", role: "Sous Chef", department: "Kitchen Operations", avatar: "AG", performance: 88, attendance: 95, productivity: 85 },
  { id: "fe3", name: "Ramesh Chand", role: "Billing Cashier", department: "Front of House", avatar: "RC", performance: 94, attendance: 98, productivity: 95 }
];

export const foodFinance: FinanceRecord[] = [
  { month: "Jan", revenue: 320000, expenses: 240000, profit: 80000, cashFlow: 95000 },
  { month: "Feb", revenue: 360000, expenses: 260000, profit: 100000, cashFlow: 110000 },
  { month: "Mar", revenue: 410000, expenses: 290000, profit: 120000, cashFlow: 130000 },
  { month: "Apr", revenue: 430000, expenses: 310000, profit: 120000, cashFlow: 125000 },
  { month: "May", revenue: 450000, expenses: 330000, profit: 120000, cashFlow: 135000 },
  { month: "Jun", revenue: 485000, expenses: 370000, profit: 115000, cashFlow: 145000 }
];


// ----------------------------------------------------
// 3. E-COMMERCE & RETAIL (SHOPIFY / ONLINE STORE)
// ----------------------------------------------------
export const retailKPIs: KPI[] = [
  { name: "Revenue", value: "₹8.45 L", change: "+22.5% vs last month", isPositive: true, score: 95 },
  { name: "Profit", value: "₹2.20 L", change: "+14.0% vs last month", isPositive: true, score: 91 },
  { name: "Cash Flow", value: "₹2.80 L", change: "+18.1% vs last month", isPositive: true, score: 90 },
  { name: "Inventory Health", value: "88%", change: "-1.5% low stock buffer", isPositive: false, score: 80 },
  { name: "Customer Satisfaction", value: "93.4%", change: "+0.5% support score", isPositive: true, score: 92 },
  { name: "Staff Productivity", value: "89.0%", change: "+2.0% packing velocity", isPositive: true, score: 89 }
];

export const retailCustomers: Customer[] = [
  {
    id: "rc1",
    name: "Sunita Iyer",
    email: "sunita@outlook.com",
    avatar: "SI",
    ltv: 12400,
    churnRisk: 15,
    favProducts: ["Handcrafted Leather Purse"],
    purchaseHistory: [
      { date: "2026-06-20", amount: 4500, item: "Handcrafted Leather Purse" }
    ],
    timeline: [
      { date: "2026-06-20", event: "Purchased leather purse" }
    ]
  }
];

export const retailInventory: InventoryItem[] = [
  { id: "ri1", name: "Premium Leather Wallet", stock: 85, minStock: 20, demandForecast: 12, supplier: "Hides & Crafts", supplierRisk: "low", reorderQuantity: 30, status: "In Stock" },
  { id: "ri2", name: "Wireless Fast Charging Pad", stock: 8, minStock: 15, demandForecast: 28, supplier: "VoltTech Shenzhen", supplierRisk: "medium", reorderQuantity: 20, status: "Low Stock" },
  { id: "ri3", name: "Oversized Cotton Tee (Black)", stock: 240, minStock: 50, demandForecast: 15, supplier: "Tirupur Apparel Source", supplierRisk: "low", reorderQuantity: 100, status: "In Stock" }
];

export const retailEmployees: Employee[] = [
  { id: "re1", name: "Aarav Kapoor", role: "Store Manager", department: "Operations", avatar: "AK", performance: 90, attendance: 94, productivity: 91 },
  { id: "re2", name: "Sneha Sen", role: "Product Lister", department: "Marketing", avatar: "SS", performance: 85, attendance: 92, productivity: 88 }
];

export const retailFinance: FinanceRecord[] = [
  { month: "Jan", revenue: 520000, expenses: 390000, profit: 130000, cashFlow: 180000 },
  { month: "Feb", revenue: 580000, expenses: 420000, profit: 160000, cashFlow: 200000 },
  { month: "Mar", revenue: 640000, expenses: 460000, profit: 180000, cashFlow: 220000 },
  { month: "Apr", revenue: 710000, expenses: 500000, profit: 210000, cashFlow: 240000 },
  { month: "May", revenue: 780000, expenses: 560000, profit: 220000, cashFlow: 260000 },
  { month: "Jun", revenue: 845000, expenses: 625000, profit: 220000, cashFlow: 280000 }
];


// ----------------------------------------------------
// 4. CUSTOM / GENERIC BUSINESS PRESET
// ----------------------------------------------------
export const customKPIs: KPI[] = [
  { name: "Revenue", value: "₹2.70 L", change: "+14.0% vs last month", isPositive: true, score: 92 },
  { name: "Profit", value: "₹90 K", change: "+8.0% vs last month", isPositive: true, score: 87 },
  { name: "Cash Flow", value: "₹1.20 L", change: "+11.0% vs last month", isPositive: true, score: 90 },
  { name: "Inventory Health", value: "95%", change: "All items stable", isPositive: true, score: 95 },
  { name: "Customer Satisfaction", value: "94.0%", change: "+0.5% support score", isPositive: true, score: 94 },
  { name: "Staff Productivity", value: "90.0%", change: "+2.0% output rating", isPositive: true, score: 90 }
];

export const customCustomers: Customer[] = [
  {
    id: "cc1",
    name: "General Client Alpha",
    email: "alpha@company.com",
    avatar: "CA",
    ltv: 50000,
    churnRisk: 10,
    favProducts: ["Standard Service Package"],
    purchaseHistory: [{ date: "2026-07-01", amount: 25000, item: "Standard Service Package" }],
    timeline: [{ date: "2026-07-01", event: "Workspace account initialized" }]
  }
];

export const customInventory: InventoryItem[] = [
  { id: "ci1", name: "Standard Operational Asset A", stock: 150, minStock: 25, demandForecast: 12, supplier: "General Supply Partners", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" }
];

export const customEmployees: Employee[] = [
  { id: "ce1", name: "Suresh Patel", role: "Operations Lead", department: "Operations", avatar: "SP", performance: 91, attendance: 96, productivity: 90 }
];

export const customFinance: FinanceRecord[] = [
  { month: "Jan", revenue: 200000, expenses: 140000, profit: 60000, cashFlow: 80000 },
  { month: "Feb", revenue: 220000, expenses: 150000, profit: 70000, cashFlow: 90000 },
  { month: "Mar", revenue: 230000, expenses: 160000, profit: 70000, cashFlow: 100000 },
  { month: "Apr", revenue: 240000, expenses: 160000, profit: 80000, cashFlow: 110000 },
  { month: "May", revenue: 250000, expenses: 170000, profit: 80000, cashFlow: 110000 },
  { month: "Jun", revenue: 270000, expenses: 180000, profit: 90000, cashFlow: 120000 }
];

// ----------------------------------------------------
// GLOBAL GETTERS
// ----------------------------------------------------
export function getMockData(templateName: string) {
  switch (templateName) {
    case "restaurant":
      return {
        kpis: foodKPIs,
        customers: foodCustomers,
        inventory: foodInventory,
        employees: foodEmployees,
        finance: foodFinance
      };
    case "retail":
      return {
        kpis: retailKPIs,
        customers: retailCustomers,
        inventory: retailInventory,
        employees: retailEmployees,
        finance: retailFinance
      };
    case "custom":
      return {
        kpis: customKPIs,
        customers: customCustomers,
        inventory: customInventory,
        employees: customEmployees,
        finance: customFinance
      };
    default:
      return {
        kpis: saasKPIs,
        customers: saasCustomers,
        inventory: saasInventory,
        employees: saasEmployees,
        finance: saasFinance
      };
  }
}

// Fallback initial core variables mapping legacy imports
export const initialKPIs = saasKPIs;
export const initialCustomers = saasCustomers;
export const initialInventory = saasInventory;
export const initialEmployees = saasEmployees;
export const initialFinance = saasFinance;

export const initialNodes: BusinessNode[] = [
  { id: "business", label: "TwinIQ Core", health: "green", score: 87, description: "TwinIQ digital twin core engine. Operating optimally.", x: 400, y: 300, details: ["Overall Score: 87%", "All data feeds connected", "Active predictions loaded"] },
  { id: "customers", label: "Customers", health: "green", score: 95, description: "Customer satisfaction, LTV, retention indexes.", x: 400, y: 100, details: ["CSAT Score: 94.6%", "LTV Average: ₹1.8L", "Churn Probability: 4.2% avg"] },
  { id: "finance", label: "Finance", health: "green", score: 90, description: "Cash flow tracking, EBITDA projections, invoice processing.", x: 600, y: 180, details: ["Net Profit Margin: 31%", "Cash Reserves: ₹52.1 L", "Receivables collection: 14 days average"] },
  { id: "inventory", label: "Inventory", health: "yellow", score: 72, description: "Stock levels, SKU rotation, supply delays.", x: 650, y: 350, details: ["Active SKUs: 1,240", "Low stock alerts: 4 SKUs", "Procurement delays: 1 key supplier"] },
  { id: "employees", label: "Employees", health: "green", score: 89, description: "E-NPS, performance evaluation, retention rates.", x: 550, y: 480, details: ["FTEs count: 42", "Productivity Index: 89.2%", "E-NPS Score: 78/100"] },
  { id: "suppliers", label: "Suppliers", health: "red", score: 45, description: "Supplier SLA targets, material delays, procurement risk.", x: 250, y: 480, details: ["Supplier SLA: 76% (Target: 95%)", "Active shipment delays: 2 containers", "Lead time spike: +12 days"] },
  { id: "sales", label: "Sales", health: "green", score: 92, description: "Pipeline health, CRM closing velocity, MRR tracking.", x: 150, y: 350, details: ["Pipeline Value: ₹3.2 Cr", "Win Rate: 28%", "SQL to Won velocity: 19 days"] },
  { id: "marketing", label: "Marketing", health: "green", score: 85, description: "CAC, LTV-to-CAC, brand sentiment, ROAS.", x: 200, y: 180, details: ["ROAS: 4.2x (Instagram)", "CAC Average: ₹1,200", "Monthly Traffic: 250k sessions"] },
  { id: "operations", label: "Operations", health: "yellow", score: 78, description: "Order fulfillment times, system uptime, logistics efficiency.", x: 400, y: 500, details: ["Fulfillment time: 28 hrs (Target: 24 hrs)", "Warehouse utilization: 91%", "Deliveries on time: 94.1%"] },
];

export const initialEvents: BusinessEvent[] = [
  { id: "ev1", time: "10:42 AM", title: "Procurement Delayed", description: "Matrix Semi HK flagged shipping delay due to customs clearance hold. Impact estimate ₹85k.", category: "supplier", severity: "error" },
  { id: "ev2", time: "09:15 AM", title: "Low Stock Alert", description: "Fiber Optic Interface Switch count fell below safe threshold of 20 (currently 12).", category: "inventory", severity: "warning" },
  { id: "ev3", time: "Yesterday", title: "Milestone Reached", description: "MalhotraTech completed final phase onboarding, unlocking ₹1.5L recurring billing.", category: "sales", severity: "info" }
];

export const mockIntelligence = [
  { id: "i-1", text: "You may lose ₹85,000 due to delayed procurement of Matrix Semi chipset.", type: "danger" },
  { id: "i-2", text: "Product Alpha Server Node demand is expected to increase by 18% next week.", type: "success" },
  { id: "i-3", text: "Customer Stellar Brands has an 82% chance of churn due to inactivity.", type: "warning" }
];

export interface SimulationInput {
  priceChange: number;
  hireCount: number;
  inventoryChange: number;
  marketingBudget: number;
  openBranch: boolean;
  increaseSalaries: number;
  reduceDiscounts: boolean;
  switchSuppliers: boolean;
}

export interface ScenarioResult {
  revenue: number;
  profit: number;
  retention: number;
  inventoryRisk: string;
  cashFlow: number;
  riskScore: number;
  confidence: number;
}

export function runBusinessSimulation(input: SimulationInput) {
  const baseRevenue = 12400000;
  const baseProfit = 3850000;
  const baseRetention = 94.6;
  const baseCashFlow = 5210000;
  
  let revMult = 1.0;
  let profMult = 1.0;
  let retMult = 1.0;
  let riskScore = 20;

  if (input.priceChange > 0) {
    revMult += (input.priceChange * 0.4) / 100;
    retMult -= (input.priceChange * 0.7) / 100;
    profMult += (input.priceChange * 0.5) / 100;
    riskScore += input.priceChange * 0.8;
  } else {
    revMult += (input.priceChange * 0.3) / 100;
    retMult += (-input.priceChange * 0.4) / 100;
    profMult += (input.priceChange * 0.6) / 100;
    riskScore += -input.priceChange * 0.2;
  }

  if (input.hireCount > 0) {
    profMult -= (input.hireCount * 3) / 100;
    revMult += (input.hireCount * 1.5) / 100;
    riskScore -= input.hireCount * 1.5;
  }

  if (input.marketingBudget !== 0) {
    revMult += (input.marketingBudget * 0.25) / 100;
    profMult += (input.marketingBudget * 0.08) / 100;
    retMult += (input.marketingBudget * 0.05) / 100;
    riskScore += input.marketingBudget * 0.15;
  }

  if (input.openBranch) {
    revMult += 0.30;
    profMult -= 0.15;
    riskScore += 25;
  }

  if (input.switchSuppliers) {
    profMult += 0.05;
    riskScore -= 15;
  }

  if (input.reduceDiscounts) {
    profMult += 0.12;
    revMult -= 0.05;
    retMult -= 0.03;
    riskScore += 5;
  }

  if (input.increaseSalaries > 0) {
    profMult -= (input.increaseSalaries * 0.5) / 100;
    retMult += (input.increaseSalaries * 0.1) / 100;
    riskScore -= (input.increaseSalaries * 0.5);
  }

  let simulatedRetention = Math.min(100, Math.max(20, baseRetention * retMult));
  let finalRisk = Math.min(100, Math.max(5, riskScore));

  const neutral: ScenarioResult = {
    revenue: baseRevenue * revMult,
    profit: baseProfit * profMult,
    retention: simulatedRetention,
    inventoryRisk: input.inventoryChange < -20 ? "HIGH RISK" : "OPTIMAL",
    cashFlow: baseCashFlow * (revMult * 0.8 + profMult * 0.2),
    riskScore: finalRisk,
    confidence: 85
  };

  return {
    neutral,
    optimistic: { ...neutral, revenue: neutral.revenue * 1.15, profit: neutral.profit * 1.20, retention: Math.min(100, neutral.retention * 1.05) },
    worstCase: { ...neutral, revenue: neutral.revenue * 0.80, profit: neutral.profit * 0.70, retention: Math.max(20, neutral.retention * 0.85) }
  };
}
