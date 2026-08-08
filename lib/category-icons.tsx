import React from "react";
import { 
  Utensils, 
  Car, 
  Home, 
  Film, 
  ShoppingBag, 
  Pill, 
  GraduationCap, 
  FileText, 
  Smartphone, 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Gift, 
  RotateCcw, 
  Package 
} from "lucide-react";

export function getCategoryIcon(category: string, className: string = "w-4 h-4") {
  const cat = category.toLowerCase();
  switch (cat) {
    case "food":
      return <Utensils className={className} />;
    case "transport":
      return <Car className={className} />;
    case "housing":
      return <Home className={className} />;
    case "entertainment":
      return <Film className={className} />;
    case "shopping":
      return <ShoppingBag className={className} />;
    case "health":
      return <Pill className={className} />;
    case "education":
      return <GraduationCap className={className} />;
    case "bills":
      return <FileText className={className} />;
    case "subscriptions":
      return <Smartphone className={className} />;
    case "salary":
      return <Briefcase className={className} />;
    case "freelance":
      return <Laptop className={className} />;
    case "investment":
      return <TrendingUp className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "refund":
      return <RotateCcw className={className} />;
    default:
      return <Package className={className} />;
  }
}
