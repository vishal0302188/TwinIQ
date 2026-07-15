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
  { name: "ARR (Annual Recurring)", value: "₹12.4 Cr", change: "+14.2% vs last month", isPositive: true, score: 92 },
  { name: "Net Monthly Burn", value: "₹8.5 L", change: "-12.4% lower expenses", isPositive: true, score: 87 },
  { name: "Cash Runway", value: "18 Months", change: "Safe cash reserves", isPositive: true, score: 90 },
  { name: "Cloud Infra Health", value: "92%", change: "-2.1% cloud quota limit", isPositive: false, score: 72 },
  { name: "Customer Satisfaction", value: "94.6%", change: "+0.8% CSAT rating", isPositive: true, score: 95 },
  { name: "Sprint Velocity", value: "89.2%", change: "+3.1% task completions", isPositive: true, score: 89 }
];

export const saasCustomers: Customer[] = [
  {
    id: "c1",
    name: "Acme Corp (AI Tier)",
    email: "billing@acme.com",
    avatar: "AC",
    ltv: 4850000,
    churnRisk: 14,
    favProducts: ["Enterprise AI Module", "Custom LLM Fine-Tuning"],
    purchaseHistory: [
      { date: "2026-06-15", amount: 1500000, item: "Enterprise AI Module" },
      { date: "2026-04-10", amount: 2500000, item: "Custom LLM Fine-Tuning" }
    ],
    timeline: [
      { date: "2026-06-15", event: "Upgraded subscription package to Premium Enterprise AI" },
      { date: "2026-05-20", event: "Support Ticket Resolved: LLM inference latency spikes" }
    ]
  },
  {
    id: "c2",
    name: "Stripe India (Beta Tech)",
    email: "accounts@stripe.com",
    avatar: "ST",
    ltv: 8200000,
    churnRisk: 82,
    favProducts: ["Enterprise AI Module", "Premium Compute Node"],
    purchaseHistory: [
      { date: "2026-05-18", amount: 4200000, item: "Enterprise AI Module" }
    ],
    timeline: [
      { date: "2026-06-28", event: "High inactivity (Zero admin console sessions in 14 days)" }
    ]
  },
  {
    id: "c3",
    name: "Y-Combinator Cohort Partners",
    email: "partner@yc.com",
    avatar: "YC",
    ltv: 9500000,
    churnRisk: 5,
    favProducts: ["Analytics Dashboard Bundle", "Custom LLM Fine-Tuning"],
    purchaseHistory: [
      { date: "2026-06-01", amount: 5500000, item: "Analytics Dashboard Bundle" },
      { date: "2026-03-12", amount: 4000000, item: "Custom LLM Fine-Tuning" }
    ],
    timeline: [
      { date: "2026-06-01", event: "Activated YC batch package promotion licenses" }
    ]
  },
  {
    id: "c4",
    name: "Zeta Payments (Scale Tier)",
    email: "scale-billing@zeta.com",
    avatar: "ZE",
    ltv: 6800000,
    churnRisk: 78,
    favProducts: ["Custom API Integrations", "Enterprise AI Module"],
    purchaseHistory: [
      { date: "2026-05-25", amount: 6800000, item: "Custom API Integrations" }
    ],
    timeline: [
      { date: "2026-07-10", event: "Webhook delivery failure: Connection timed out" }
    ]
  },
  {
    id: "c5",
    name: "Razorpay Direct",
    email: "billing@razorpay.com",
    avatar: "RP",
    ltv: 5500000,
    churnRisk: 18,
    favProducts: ["Enterprise AI Module"],
    purchaseHistory: [
      { date: "2026-05-02", amount: 5500000, item: "Enterprise AI Module" }
    ],
    timeline: [
      { date: "2026-05-02", event: "Onboarding checklist completed: Seed data ingested" }
    ]
  },
  {
    id: "c6",
    name: "CRED Tech Labs",
    email: "growth@cred.club",
    avatar: "CR",
    ltv: 4200000,
    churnRisk: 45,
    favProducts: ["Analytics Dashboard Bundle"],
    purchaseHistory: [
      { date: "2026-04-18", amount: 4200000, item: "Analytics Dashboard Bundle" }
    ],
    timeline: [
      { date: "2026-06-20", event: "Support query: Ingestion API latency metrics requested" }
    ]
  },
  {
    id: "c7",
    name: "Paytm PG Team",
    email: "pg-tech@paytm.com",
    avatar: "PT",
    ltv: 12000000,
    churnRisk: 12,
    favProducts: ["Enterprise AI Module", "Custom API Integrations"],
    purchaseHistory: [
      { date: "2026-06-20", amount: 8000000, item: "Enterprise AI Module" },
      { date: "2026-02-15", amount: 4000000, item: "Custom API Integrations" }
    ],
    timeline: [
      { date: "2026-06-20", event: "Completed SOC-2 Type II regulatory security compliance check" }
    ]
  },
  {
    id: "c8",
    name: "Swiggy Engine Hub",
    email: "swiggy-labs@swiggy.in",
    avatar: "SW",
    ltv: 8800000,
    churnRisk: 72,
    favProducts: ["Enterprise AI Module"],
    purchaseHistory: [
      { date: "2026-05-10", amount: 8800000, item: "SaaS Core Module" }
    ],
    timeline: [
      { date: "2026-07-08", event: "Inactivity warning: No active API requests logged for 7 days" }
    ]
  }
];

export const saasInventory: InventoryItem[] = [
  { id: "i1", name: "AWS EC2 Spot Instance Clusters", stock: 145, minStock: 25, demandForecast: 18, supplier: "Amazon Web Services", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" },
  { id: "i2", name: "OpenAI Token Quota (M/min)", stock: 12, minStock: 20, demandForecast: 5, supplier: "OpenAI Inc", supplierRisk: "medium", reorderQuantity: 30, status: "Low Stock" },
  { id: "i3", name: "Vercel Edge Function Seats", stock: 4, minStock: 15, demandForecast: 22, supplier: "Vercel Enterprise", supplierRisk: "high", reorderQuantity: 25, status: "Low Stock" },
  { id: "i4", name: "PostgreSQL Storage Capacity (GB)", stock: 0, minStock: 50, demandForecast: 30, supplier: "Supabase Cloud", supplierRisk: "high", reorderQuantity: 100, status: "Out of Stock" },
  { id: "i5", name: "Pinecone Vector Index Spaces", stock: 85, minStock: 15, demandForecast: 10, supplier: "Pinecone Systems", supplierRisk: "low", reorderQuantity: 20, status: "In Stock" },
  { id: "i6", name: "GitHub Enterprise Dev Licenses", stock: 20, minStock: 10, demandForecast: 8, supplier: "GitHub Inc", supplierRisk: "low", reorderQuantity: 15, status: "In Stock" },
  { id: "i7", name: "Auth0 MAU Connection Capacity", stock: 3, minStock: 5, demandForecast: 12, supplier: "Okta Inc / Auth0", supplierRisk: "medium", reorderQuantity: 5, status: "Low Stock" },
  { id: "i8", name: "SendGrid Mail Relay Credits (10k)", stock: 62, minStock: 20, demandForecast: 25, supplier: "Twilio SendGrid", supplierRisk: "low", reorderQuantity: 40, status: "In Stock" },
  { id: "i9", name: "Algolia Search Queries Units (10k)", stock: 7, minStock: 10, demandForecast: 15, supplier: "Algolia Inc", supplierRisk: "medium", reorderQuantity: 10, status: "Low Stock" },
  { id: "i10", name: "Cloudflare Core Bandwidth (TB)", stock: 112, minStock: 30, demandForecast: 40, supplier: "Cloudflare Inc", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" }
];

export const saasEmployees: Employee[] = [
  { id: "e1", name: "Kunal Dey", role: "Founder & CEO", department: "Executive", avatar: "KD", performance: 94, attendance: 98, productivity: 95 },
  { id: "e2", name: "Ritu Sengupta", role: "Co-Founder & CTO", department: "Engineering", avatar: "RS", performance: 88, attendance: 95, productivity: 87 },
  { id: "e3", name: "Kabir Khan", role: "Lead AI Architect", department: "Engineering", avatar: "KK", performance: 82, attendance: 92, productivity: 81 },
  { id: "e4", name: "Pooja Hegde", role: "Head of Growth & Marketing", department: "Marketing", avatar: "PH", performance: 96, attendance: 99, productivity: 97 },
  { id: "e5", name: "Vikram Malhotra", role: "Senior Frontend Engineer", department: "Engineering", avatar: "VM", performance: 92, attendance: 97, productivity: 91 },
  { id: "e6", name: "Ananya Sharma", role: "Customer Success Lead", department: "Customer Success", avatar: "AS", performance: 95, attendance: 96, productivity: 93 },
  { id: "e7", name: "Sameer Verma", role: "DevOps Engineer", department: "Engineering", avatar: "SV", performance: 85, attendance: 94, productivity: 86 },
  { id: "e8", name: "Neha Gupta", role: "Lead Product Designer", department: "Product Design", avatar: "NG", performance: 89, attendance: 93, productivity: 88 },
  { id: "e9", name: "Arjun Mehta", role: "Security Auditor", department: "Engineering", avatar: "AM", performance: 90, attendance: 95, productivity: 89 },
  { id: "e10", name: "Deepa Rao", role: "Finance Counsel", department: "Finance", avatar: "DR", performance: 91, attendance: 97, productivity: 90 }
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
  },
  {
    id: "fc3",
    name: "Zomato Delivery #8821",
    email: "zomato_user_8821@gmail.com",
    avatar: "ZO",
    ltv: 52000,
    churnRisk: 40,
    favProducts: ["Mutton Biryani", "Mirchi Ka Salan"],
    purchaseHistory: [
      { date: "2026-07-12", amount: 1200, item: "Mutton Biryani Pack" }
    ],
    timeline: [
      { date: "2026-07-12", event: "Zomato rider dispatched from kitchen" }
    ]
  },
  {
    id: "fc4",
    name: "Aditya Birla Group (Catering)",
    email: "corporate-catering@adityabirla.com",
    avatar: "AB",
    ltv: 340000,
    churnRisk: 15,
    favProducts: ["Royal Veg Buffet", "Assorted Desserts"],
    purchaseHistory: [
      { date: "2026-06-30", amount: 150000, item: "Royal Veg Buffet Setup" },
      { date: "2026-05-15", amount: 190000, item: "Corporate Lunch Catering" }
    ],
    timeline: [
      { date: "2026-06-30", event: "Completed corporate anniversary dinner setup for 300 guests" }
    ]
  },
  {
    id: "fc5",
    name: "Priya Nair (Premium Member)",
    email: "priya_nair@outlook.com",
    avatar: "PN",
    ltv: 65000,
    churnRisk: 8,
    favProducts: ["Tandoori Platter", "Fresh Lime Soda"],
    purchaseHistory: [
      { date: "2026-07-05", amount: 1800, item: "Family Dinner Combo" }
    ],
    timeline: [
      { date: "2026-07-05", event: "Dine-in: Reserved VIP Table 1 for family dinner" }
    ]
  },
  {
    id: "fc6",
    name: "Swiggy Order #9910",
    email: "swiggy_user_9910@gmail.com",
    avatar: "SW",
    ltv: 28000,
    churnRisk: 25,
    favProducts: ["Paneer Butter Masala", "Garlic Naan"],
    purchaseHistory: [
      { date: "2026-07-14", amount: 650, item: "Paneer Butter Masala Pack" }
    ],
    timeline: [
      { date: "2026-07-14", event: "Order received and queued in main kitchen burner" }
    ]
  },
  {
    id: "fc7",
    name: "Rahul Malhotra (Regular)",
    email: "rahul_malhotra@gmail.com",
    avatar: "RM",
    ltv: 44000,
    churnRisk: 12,
    favProducts: ["Butter Chicken", "Rumali Roti"],
    purchaseHistory: [
      { date: "2026-07-09", amount: 980, item: "Butter Chicken Dinner Pack" }
    ],
    timeline: [
      { date: "2026-07-09", event: "Dine-in: Settle bill via UPI payment node" }
    ]
  },
  {
    id: "fc8",
    name: "Tech Mahindra Guest House",
    email: "admin-guesthouse@techmahindra.com",
    avatar: "TM",
    ltv: 210000,
    churnRisk: 5,
    favProducts: ["Buffet Lunch Package"],
    purchaseHistory: [
      { date: "2026-06-25", amount: 210000, item: "Weekly Guest House Lunch Buffet" }
    ],
    timeline: [
      { date: "2026-06-25", event: "Executed monthly recurring corporate lunch delivery contract" }
    ]
  }
];

export const foodInventory: InventoryItem[] = [
  { id: "fi1", name: "Amul Mozzarella Cheese (Blocks)", stock: 24, minStock: 10, demandForecast: 15, supplier: "Amul Dairy Margins", supplierRisk: "low", reorderQuantity: 15, status: "In Stock" },
  { id: "fi2", name: "Chicken Breast Fillets (Kgs)", stock: 2, minStock: 8, demandForecast: 25, supplier: "Local Poultry Farms", supplierRisk: "high", reorderQuantity: 10, status: "Low Stock" },
  { id: "fi3", name: "Whole Wheat Pizza Dough balls", stock: 120, minStock: 30, demandForecast: 10, supplier: "Wheat Bakery Source", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" },
  { id: "fi4", name: "Eco Takeaway Packaging Boxes", stock: 0, minStock: 100, demandForecast: 35, supplier: "EcoPack Printers", supplierRisk: "medium", reorderQuantity: 200, status: "Out of Stock" },
  { id: "fi5", name: "Tandoori Spice Marinade Mix (Kgs)", stock: 45, minStock: 10, demandForecast: 12, supplier: "SpiceKingdom", supplierRisk: "low", reorderQuantity: 20, status: "In Stock" },
  { id: "fi6", name: "Basmati Rice Premium (50Kg Bags)", stock: 8, minStock: 5, demandForecast: 4, supplier: "Punjab Grain Mills", supplierRisk: "low", reorderQuantity: 5, status: "In Stock" },
  { id: "fi7", name: "Refined Sunflower Cooking Oil (Ltrs)", stock: 80, minStock: 20, demandForecast: 30, supplier: "Fortune Oils", supplierRisk: "low", reorderQuantity: 40, status: "In Stock" },
  { id: "fi8", name: "Fresh Paneer Cottage Cheese (Kgs)", stock: 3, minStock: 15, demandForecast: 25, supplier: "Amul Dairy Margins", supplierRisk: "medium", reorderQuantity: 20, status: "Low Stock" },
  { id: "fi9", name: "Disinfectant Hand Wash Liquid (Ltrs)", stock: 12, minStock: 5, demandForecast: 3, supplier: "Hygiene Plus", supplierRisk: "low", reorderQuantity: 10, status: "In Stock" },
  { id: "fi10", name: "LPG Gas Cylinder Refill 19Kg", stock: 2, minStock: 4, demandForecast: 6, supplier: "Indane Commercial", supplierRisk: "high", reorderQuantity: 5, status: "Low Stock" }
];

export const foodEmployees: Employee[] = [
  { id: "fe1", name: "Rahul Sharma", role: "Head Chef", department: "Kitchen Operations", avatar: "RS", performance: 92, attendance: 96, productivity: 94 },
  { id: "fe2", name: "Aditi Gowda", role: "Sous Chef", department: "Kitchen Operations", avatar: "AG", performance: 88, attendance: 95, productivity: 85 },
  { id: "fe3", name: "Ramesh Chand", role: "Billing Cashier", department: "Front of House", avatar: "RC", performance: 94, attendance: 98, productivity: 95 },
  { id: "fe4", name: "Sandeep Joshi", role: "Restaurant General Manager", department: "Front of House", avatar: "SJ", performance: 95, attendance: 97, productivity: 93 },
  { id: "fe5", name: "Karan Thapar", role: "Senior Steward", department: "Service Staff", avatar: "KT", performance: 90, attendance: 94, productivity: 91 },
  { id: "fe6", name: "Meera Nair", role: "Head Pastry Chef", department: "Kitchen Operations", avatar: "MN", performance: 91, attendance: 96, productivity: 89 },
  { id: "fe7", name: "Amit Mishra", role: "Delivery Coordinator", department: "Logistics", avatar: "AM", performance: 86, attendance: 93, productivity: 88 },
  { id: "fe8", name: "Divya Rao", role: "Junior Steward", department: "Service Staff", avatar: "DR", performance: 88, attendance: 92, productivity: 86 }
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
  },
  {
    id: "rc2",
    name: "Karan Johar (Club Member)",
    email: "karan_johar@gmail.com",
    avatar: "KJ",
    ltv: 85000,
    churnRisk: 10,
    favProducts: ["Premium Leather Wallet", "Wireless Fast Charging Pad"],
    purchaseHistory: [
      { date: "2026-07-01", amount: 4500, item: "Premium Leather Wallet" },
      { date: "2026-06-12", amount: 2500, item: "Wireless Fast Charging Pad" }
    ],
    timeline: [
      { date: "2026-07-01", event: "Upgraded account membership to Gold Tier" }
    ]
  },
  {
    id: "rc3",
    name: "Meenakshi Sen",
    email: "meenakshi@sen.com",
    avatar: "MS",
    ltv: 42000,
    churnRisk: 20,
    favProducts: ["Oversized Cotton Tee (Black)"],
    purchaseHistory: [
      { date: "2026-07-10", amount: 1800, item: "Oversized Cotton Tee (Black)" }
    ],
    timeline: [
      { date: "2026-07-10", event: "Order delivered via Amazon Logistics Hub" }
    ]
  },
  {
    id: "rc4",
    name: "Amazon Logistics Hub (Bulk)",
    email: "procurement@amazonhub.com",
    avatar: "AL",
    ltv: 560000,
    churnRisk: 5,
    favProducts: ["Oversized Cotton Tee (Black)", "Silicon Phone Protective Case"],
    purchaseHistory: [
      { date: "2026-06-25", amount: 250000, item: "Bulk Cotton Tees (Black)" },
      { date: "2026-05-18", amount: 310000, item: "Bulk Silicon Protective Cases" }
    ],
    timeline: [
      { date: "2026-06-25", event: "Shipped 200 items under standard B2B invoice terms" }
    ]
  },
  {
    id: "rc5",
    name: "Rajesh Khanna",
    email: "rajesh_khanna@gmail.com",
    avatar: "RK",
    ltv: 28500,
    churnRisk: 35,
    favProducts: ["Premium Canvas Backpack"],
    purchaseHistory: [
      { date: "2026-07-04", amount: 3200, item: "Premium Canvas Backpack" }
    ],
    timeline: [
      { date: "2026-07-04", event: "Purchased backpack via Shopify direct web portal" }
    ]
  },
  {
    id: "rc6",
    name: "Flipkart Orders (API Node)",
    email: "api-orders@flipkart.com",
    avatar: "FK",
    ltv: 480000,
    churnRisk: 15,
    favProducts: ["Wireless Fast Charging Pad"],
    purchaseHistory: [
      { date: "2026-07-11", amount: 120000, item: "Bulk Charging Pads" }
    ],
    timeline: [
      { date: "2026-07-11", event: "Connected API node webhook receiver payload successfully" }
    ]
  },
  {
    id: "rc7",
    name: "Divya Patel",
    email: "divya_patel@yahoo.com",
    avatar: "DP",
    ltv: 62000,
    churnRisk: 8,
    favProducts: ["Stainless Steel Insulated Flask"],
    purchaseHistory: [
      { date: "2026-07-03", amount: 1500, item: "Stainless Steel Insulated Flask" }
    ],
    timeline: [
      { date: "2026-07-03", event: "Account active with 4 session page views in 24 hours" }
    ]
  },
  {
    id: "rc8",
    name: "Tanya Kapoor",
    email: "tanya_k@gmail.com",
    avatar: "TK",
    ltv: 33000,
    churnRisk: 50,
    favProducts: ["Anti-Glare BlueLight Specs"],
    purchaseHistory: [
      { date: "2026-06-15", amount: 1800, item: "Anti-Glare BlueLight Specs" }
    ],
    timeline: [
      { date: "2026-06-15", event: "Logged ticket: Request exchange for frame sizing" }
    ]
  }
];

export const retailInventory: InventoryItem[] = [
  { id: "ri1", name: "Premium Leather Wallet", stock: 85, minStock: 20, demandForecast: 12, supplier: "Hides & Crafts", supplierRisk: "low", reorderQuantity: 30, status: "In Stock" },
  { id: "ri2", name: "Wireless Fast Charging Pad", stock: 8, minStock: 15, demandForecast: 28, supplier: "VoltTech Shenzhen", supplierRisk: "medium", reorderQuantity: 20, status: "Low Stock" },
  { id: "ri3", name: "Oversized Cotton Tee (Black)", stock: 240, minStock: 50, demandForecast: 15, supplier: "Tirupur Apparel Source", supplierRisk: "low", reorderQuantity: 100, status: "In Stock" },
  { id: "ri4", name: "Tempered Glass Screen Guard", stock: 500, minStock: 100, demandForecast: 80, supplier: "GlassArmor Labs", supplierRisk: "low", reorderQuantity: 200, status: "In Stock" },
  { id: "ri5", name: "Silicon Phone Protective Case", stock: 320, minStock: 50, demandForecast: 60, supplier: "VoltTech Shenzhen", supplierRisk: "medium", reorderQuantity: 100, status: "In Stock" },
  { id: "ri6", name: "Stainless Steel Insulated Flask", stock: 45, minStock: 15, demandForecast: 20, supplier: "Milton Housewares", supplierRisk: "low", reorderQuantity: 25, status: "In Stock" },
  { id: "ri7", name: "Wireless Bluetooth Earbuds v5.3", stock: 18, minStock: 30, demandForecast: 35, supplier: "AcousticTech Shenz", supplierRisk: "high", reorderQuantity: 50, status: "Low Stock" },
  { id: "ri8", name: "Premium Canvas Backpack", stock: 14, minStock: 20, demandForecast: 15, supplier: "GearUp Travel", supplierRisk: "low", reorderQuantity: 10, status: "Low Stock" },
  { id: "ri9", name: "Anti-Glare BlueLight Specs", stock: 88, minStock: 15, demandForecast: 10, supplier: "VisionTech Delhi", supplierRisk: "low", reorderQuantity: 20, status: "In Stock" },
  { id: "ri10", name: "Adjustable Desk Phone Stand", stock: 150, minStock: 25, demandForecast: 30, supplier: "VoltTech Shenzhen", supplierRisk: "medium", reorderQuantity: 50, status: "In Stock" }
];

export const retailEmployees: Employee[] = [
  { id: "re1", name: "Aarav Kapoor", role: "Store Manager", department: "Operations", avatar: "AK", performance: 90, attendance: 94, productivity: 91 },
  { id: "re2", name: "Sneha Sen", role: "Product Lister", department: "Marketing", avatar: "SS", performance: 85, attendance: 92, productivity: 88 },
  { id: "re3", name: "Pooja Bhatt", role: "Sales Executive", department: "Front of House", avatar: "PB", performance: 92, attendance: 96, productivity: 93 },
  { id: "re4", name: "Rohan Joshi", role: "Inventory Dispatch Exec", department: "Operations", avatar: "RJ", performance: 88, attendance: 94, productivity: 87 },
  { id: "re5", name: "Kritika Sen", role: "Customer Support Specialist", department: "Customer Success", avatar: "KS", performance: 94, attendance: 95, productivity: 91 },
  { id: "re6", name: "Abhishek Bachchan", role: "Senior Merchandiser", department: "Operations", avatar: "AB", performance: 89, attendance: 93, productivity: 88 }
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
  },
  {
    id: "cc2",
    name: "General Client Beta",
    email: "beta@company.com",
    avatar: "CB",
    ltv: 75000,
    churnRisk: 15,
    favProducts: ["Premium Support Plan"],
    purchaseHistory: [{ date: "2026-06-15", amount: 45000, item: "Premium Support Plan" }],
    timeline: [{ date: "2026-06-15", event: "Database indexing setups optimized" }]
  },
  {
    id: "cc3",
    name: "General Client Gamma",
    email: "gamma@company.com",
    avatar: "CG",
    ltv: 120000,
    churnRisk: 80,
    favProducts: ["Standard Service Package"],
    purchaseHistory: [{ date: "2026-05-10", amount: 60000, item: "Standard Service Package" }],
    timeline: [{ date: "2026-07-11", event: "High inactivity (No operator logins logged for 10 days)" }]
  }
];

export const customInventory: InventoryItem[] = [
  { id: "ci1", name: "Standard Operational Asset A", stock: 150, minStock: 25, demandForecast: 12, supplier: "General Supply Partners", supplierRisk: "low", reorderQuantity: 50, status: "In Stock" },
  { id: "ci2", name: "Standard Operational Asset B", stock: 8, minStock: 15, demandForecast: 20, supplier: "Global Logistics Source", supplierRisk: "medium", reorderQuantity: 20, status: "Low Stock" }
];

export const customEmployees: Employee[] = [
  { id: "ce1", name: "Suresh Patel", role: "Operations Lead", department: "Operations", avatar: "SP", performance: 91, attendance: 96, productivity: 90 },
  { id: "ce2", name: "Harish Nair", role: "Billing Specialist", department: "Finance", avatar: "HN", performance: 88, attendance: 94, productivity: 86 }
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
  { id: "inventory", label: "Cloud Quotas", health: "yellow", score: 72, description: "API limits, DB storage, Vercel compute quotas.", x: 650, y: 350, details: ["Active Keys: 12", "Low stock alerts: 2 Quotas", "AWS overage risk: Medium"] },
  { id: "employees", label: "Dev Crew", health: "green", score: 89, description: "E-NPS, performance evaluation, retention rates.", x: 550, y: 480, details: ["FTEs count: 10", "Sprint Velocity: 89.2%", "E-NPS Score: 78/100"] },
  { id: "suppliers", label: "Cloud Providers", health: "red", score: 45, description: "API provider SLAs, network latency, outage incidents.", x: 250, y: 480, details: ["Provider SLA: 98.2% (Target: 99.9%)", "Active latency spike: +120ms", "Incidents logged: 1 (Supabase)"] },
  { id: "sales", label: "Sales Pipeline", health: "green", score: 92, description: "Pipeline health, CRM closing velocity, MRR tracking.", x: 150, y: 350, details: ["Pipeline Value: ₹3.2 Cr", "Win Rate: 28%", "SQL to Won velocity: 19 days"] },
  { id: "marketing", label: "SaaS Growth", health: "green", score: 85, description: "CAC, LTV-to-CAC, brand sentiment, ROAS.", x: 200, y: 180, details: ["ROAS: 4.2x (Google Ads)", "CAC Average: ₹1,200", "Monthly Traffic: 250k sessions"] },
  { id: "operations", label: "Operations", health: "yellow", score: 78, description: "Order fulfillment times, system uptime, logistics efficiency.", x: 400, y: 500, details: ["Fulfillment time: 28 hrs (Target: 24 hrs)", "Warehouse utilization: 91%", "Deliveries on time: 94.1%"] },
];

export const initialEvents: BusinessEvent[] = [
  { id: "ev1", time: "10:42 AM", title: "Supabase DB Full", description: "Supabase database storage capacity exceeded. Impact estimate ₹85k due to query slowdown.", category: "supplier", severity: "error" },
  { id: "ev2", time: "09:15 AM", title: "AWS Limit Warning", description: "EC2 spot instance capacity fell below threshold (currently 4 clusters).", category: "inventory", severity: "warning" },
  { id: "ev3", time: "Yesterday", title: "Acme Corp Upgraded", description: "Acme Corp (AI Tier) upgraded package, unlocking ₹1.5L recurring billing.", category: "sales", severity: "info" }
];

export const mockIntelligence = [
  { id: "i-1", text: "You may lose ₹85,000 due to delayed compute provisioning or database capacity constraints.", type: "danger" },
  { id: "i-2", text: "Vercel edge function traffic is expected to increase by 18% next week.", type: "success" },
  { id: "i-3", text: "Customer Stripe India has an 82% chance of churn due to API inactivity.", type: "warning" }
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
