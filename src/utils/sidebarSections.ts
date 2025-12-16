import {
  ClipboardList,
  PanelsTopLeft,
  Settings,
  Store,
  DollarSign,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  children?: NavItem[];
  componentKey?: string;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
};

export const sidebarSections: NavSection[] = [
  {
    title: "Удирдлага",
    icon: Settings,
    permission: "user_menu_show",
    items: [
      {
        id: "management-users",
        label: "Хэрэглэгчийн удирдлага",
        componentKey: "user-management",
        permission: "user_menu_show",
      },
      {
        id: "management-permissions",
        label: "Эрхийн удирдлага",
        componentKey: "permission-management",
        permission: "role_show",
      },
    ],
  },
  {
    title: "Мерчант цэс",
    icon: Store,
    permission: "merchant_menu_show",
    items: [
      {
        id: "merchant-list",
        label: "Мерчант жагсаалт",
        componentKey: "merchant-list",
        permission: "merchant_menu_show",
      },
    ],
  },
  {
    title: "Гэрээ бүртгэл",
    icon: ClipboardList,
    permission: "contract_menu_show",
    items: [
      {
        id: "agreement-layout",
        label: "Түрээсийн хүсэлтүүд",
        componentKey: "tenant-list",
        permission: "lease_request_show",
      },
      {
        id: "layout",
        label: "Гэрээний материал",
        componentKey: "approved-tenant-list",
        permission: "lease_agreement_show",
      },
      {
        id: "utilities",
        label: "Гэрээний процесс",
        componentKey: "contract-process",
        permission: "lease_agreement_show",
      },
      {
        id: "components",
        label: "Даатгалын мэдээлэл",
        componentKey: "insurance-management",
        permission: "lease_agreement_show",
      },
    ],
  },
  {
    title: "Талбай менежмент",
    icon: PanelsTopLeft,
    permission: "property_menu_show",
    items: [
      {
        id: "field-dashboard",
        label: "Талбай бүртгэл",
        componentKey: "property-management",
        permission: "property_menu_show",
      },
      {
        id: "rate-history",
        label: "Үнэлгээний түүх",
        componentKey: "property-rate-history",
        permission: "property_menu_show",
      },
    ],
  },
  {
    title: "Санхүү",
    icon: DollarSign,
    permission: "finance_menu_show",
    items: [
      {
        id: "finance-transactions",
        label: "Гүйлгээ",
        href: "#finance-transactions",
        permission: "finance_menu_show",
      },
      {
        id: "finance-payments",
        label: "Төлбөр",
        href: "#finance-payments",
        permission: "finance_menu_show",
      },
      {
        id: "finance-invoices",
        label: "Нэхэмжлэх",
        href: "#finance-invoices",
        permission: "finance_menu_show",
      },
      {
        id: "finance-reports",
        label: "Санхүүгийн тайлан",
        href: "#finance-reports",
        permission: "finance_menu_show",
      },
    ],
  },
  {
    title: "Бусад",
    icon: MoreHorizontal,
    permission: "other_menu_show",
    items: [
      {
        id: "other-settings",
        label: "Системийн тохиргоо",
        href: "#other-settings",
        permission: "",
      },
      {
        id: "other-help",
        label: "Тусламж",
        href: "#other-help",
      },
      {
        id: "other-about",
        label: "Системийн тухай",
        href: "#other-about",
      },
    ],
  },
];


