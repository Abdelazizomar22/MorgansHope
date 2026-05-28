import type { ComponentType } from "react";
import {
	HiCheckCircle,
	HiExclamationCircle,
	HiExclamationTriangle,
	HiXCircle,
} from "react-icons/hi2";
import type { UrgencyLevel } from "../types";

export const URGENCY_CONFIG: Record<
	UrgencyLevel,
	{
		color: string;
		bg: string;
		border: string;
		label_en: string;
		label_ar: string;
		Icon: ComponentType<{ size?: number; className?: string }>;
	}
> = {
	none: {
		color: "#22c55e",
		bg: "rgba(34,197,94,0.1)",
		border: "rgba(34,197,94,0.3)",
		label_en: "No Findings",
		label_ar: "لا توجد نتائج",
		Icon: HiCheckCircle,
	},
	low: {
		color: "#5C8374",
		bg: "rgba(92,131,116,0.1)",
		border: "rgba(92,131,116,0.3)",
		label_en: "Low Risk",
		label_ar: "خطر منخفض",
		Icon: HiExclamationCircle,
	},
	medium: {
		color: "#fbbf24",
		bg: "rgba(251,191,36,0.1)",
		border: "rgba(251,191,36,0.3)",
		label_en: "Medium Risk",
		label_ar: "خطر متوسط",
		Icon: HiExclamationTriangle,
	},
	high: {
		color: "#f87171",
		bg: "rgba(248,113,113,0.1)",
		border: "rgba(248,113,113,0.3)",
		label_en: "High Risk",
		label_ar: "خطر مرتفع",
		Icon: HiExclamationTriangle,
	},
	critical: {
		color: "#ef4444",
		bg: "rgba(239,68,68,0.15)",
		border: "rgba(239,68,68,0.4)",
		label_en: "Critical",
		label_ar: "حالة حرجة",
		Icon: HiXCircle,
	},
};
