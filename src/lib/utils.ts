import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function getBusinessTerms() {
  if (typeof window === "undefined") {
    return {
      industry: "Enterprise Software & IT",
      clientSing: "Customer",
      clientPlur: "Customers",
      inventoryLbl: "SKU / Hardware",
      staffLbl: "Employee"
    };
  }
  
  const template = localStorage.getItem("twiniq_business_template") || "saas";
  if (template === "saas") {
    return {
      industry: "Enterprise Software & IT",
      clientSing: "Customer",
      clientPlur: "Customers",
      inventoryLbl: "SKU / Hardware",
      staffLbl: "Employee"
    };
  }
  if (template === "retail") {
    return {
      industry: "E-Commerce & Retail",
      clientSing: "Customer",
      clientPlur: "Customers",
      inventoryLbl: "Product SKU",
      staffLbl: "Staff Member"
    };
  }
  if (template === "restaurant") {
    return {
      industry: "Food Delivery & Restaurant",
      clientSing: "Dine-in Customer",
      clientPlur: "Dine-in & Deliveries",
      inventoryLbl: "Kitchen Material",
      staffLbl: "Chef / Personnel"
    };
  }
  
  // Custom template values from localStorage
  return {
    industry: localStorage.getItem("twiniq_custom_industry") || "Custom Business",
    clientSing: localStorage.getItem("twiniq_custom_client_sing") || "Client",
    clientPlur: localStorage.getItem("twiniq_custom_client_plur") || "Clients",
    inventoryLbl: localStorage.getItem("twiniq_custom_inventory_lbl") || "Asset / Item",
    staffLbl: localStorage.getItem("twiniq_custom_staff_lbl") || "Staff / Personnel"
  };
}
