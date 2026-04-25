import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `You are an expert frontend architect and React + Tailwind generator.

You MUST return ONLY valid JSON (no markdown fences, no commentary, no extra prose).
The response MUST exactly match this shape:
{
  "projectTitle": "string",
  "explanation": "string",
  "files": {
    "/path/to/file.tsx": { "code": "string" }
  },
  "generatedFiles": ["/path/to/file.tsx"]
}

MANDATORY GLOBAL RULES:
1. Return ONLY JSON. No markdown. No code fences. No escaped newlines outside strings.
2. generatedFiles MUST list every file key exactly once in stable alphabetical order.
3. ALL files MUST use .tsx or .ts extension (NEVER .js or .jsx).
4. explanation MUST be one concise paragraph, no bullet points.
5. Every file code MUST be valid, complete, production-ready code.
6. Do NOT include package.json, node_modules, or build artifacts.
7. Do NOT use TODO, FIXME, placeholder, or lorem ipsum text.
8. Allowed imports only: lucide-react, date-fns, react-chartjs-2, firebase, @google/generative-ai.

WHEN PROMPT INCLUDES: dashboard, portal, admin, management, analytics, gym, SaaS, CRM, tracking:
  MANDATORY STRUCTURE:
  - Minimum 10 files total (including layout, components, pages, hooks, utils).
  - MUST include /App.tsx as the root entry point.
  - MUST include /components/ folder with at least 5 different component files.
  - MUST include at least 2 chart or analytics visualization files (e.g., /components/Charts.tsx, /components/Analytics.tsx).
  - MUST include a design tokens file (e.g., /lib/theme.ts or /styles/tokens.ts).
  - MUST include a responsive sidebar/navigation component.
  - MUST include a dashboard header/topbar component.
  - MUST include a KPI/metrics card component.
  - MUST include a data table or list view component.
  - MUST include custom hooks for data/state management if applicable.
  - Code quality: Type all components and props. Use React hooks properly. Responsive Tailwind. No hardcoded values.

DO NOT:
- Generate basic todo/crud apps disguised as dashboards.
- Use .js or .jsx file extensions.
- Include files outside the files object in generatedFiles.
- Return fewer than 10 files for dashboard/portal/admin prompts.
- Return generic layouts without visual intentionality.
- Include untyped components or loose prop handling.`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction,
});

const codeGenerationConfig = {
  temperature: 0.7,
  responseMimeType: "application/json",
};

const seededHistory = [
  {
    role: "user",
    parts: [
      {
        text: "Generate a Production Gym Management Dashboard with React + TypeScript. Include at least 10 files with proper architecture, components, charts, and responsive design. Use .tsx extensions only.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: '{"projectTitle":"ProGym Admin Dashboard","explanation":"A professional fitness management dashboard with real-time member analytics, class scheduling, revenue tracking, and attendance insights. Built with modular React components, TypeScript, Tailwind CSS, and chart.js for visual data representation. Responsive design for desktop and tablet views with role-based navigation.","files":{"/App.tsx":{"code":"import React, { useState } from \"react\";\nimport { Sidebar } from \"./components/Sidebar\";\nimport { Header } from \"./components/Header\";\nimport { Dashboard } from \"./pages/Dashboard\";\nimport { theme } from \"./lib/theme\";\n\nexport default function App() {\n  const [sidebarOpen, setSidebarOpen] = useState(true);\n\n  return (\n    <div className=\"flex h-screen bg-slate-50\">\n      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />\n      <div className=\"flex-1 flex flex-col overflow-hidden\">\n        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />\n        <main className=\"flex-1 overflow-auto p-6\">\n          <Dashboard />\n        </main>\n      </div>\n    </div>\n  );\n}"},"/pages/Dashboard.tsx":{"code":"import React from \"react\";\nimport { KPICard } from \"../components/KPICard\";\nimport { Chart } from \"../components/Chart\";\nimport { MemberList } from \"../components/MemberList\";\nimport { Users, DollarSign, Activity, TrendingUp } from \"lucide-react\";\n\nexport function Dashboard() {\n  return (\n    <div className=\"space-y-6\">\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">\n        <KPICard title=\"Active Members\" value=\"2,847\" icon={Users} trend=\"+12%\" />\n        <KPICard title=\"Monthly Revenue\" value=\"$48,500\" icon={DollarSign} trend=\"+8%\" />\n        <KPICard title=\"Classes Today\" value=\"24\" icon={Activity} trend=\"+5%\" />\n        <KPICard title=\"Growth Rate\" value=\"14%\" icon={TrendingUp} trend=\"+2%\" />\n      </div>\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n        <Chart />\n        <MemberList />\n      </div>\n    </div>\n  );\n}"},"/components/Sidebar.tsx":{"code":"import React from \"react\";\nimport { Home, Users, Calendar, TrendingUp, Settings, LogOut } from \"lucide-react\";\n\ninterface SidebarProps {\n  open: boolean;\n  onToggle: () => void;\n}\n\nexport function Sidebar({ open, onToggle }: SidebarProps) {\n  const menuItems = [\n    { icon: Home, label: \"Dashboard\", href: \"#\" },\n    { icon: Users, label: \"Members\", href: \"#\" },\n    { icon: Calendar, label: \"Classes\", href: \"#\" },\n    { icon: TrendingUp, label: \"Analytics\", href: \"#\" },\n    { icon: Settings, label: \"Settings\", href: \"#\" },\n  ];\n\n  return (\n    <aside className={`${open ? \"w-64\" : \"w-20\"} bg-slate-900 text-white transition-all duration-300 p-4 flex flex-col`}>\n      <h1 className={`font-bold text-lg mb-8 ${!open && \"hidden\"}`}>💪 ProGym</h1>\n      <nav className=\"space-y-3 flex-1\">\n        {menuItems.map((item) => (\n          <a key={item.label} href={item.href} className=\"flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition\">\n            <item.icon size={20} />\n            {open && <span className=\"text-sm\">{item.label}</span>}\n          </a>\n        ))}\n      </nav>\n      <button className=\"flex items-center gap-3 p-2 text-slate-400 hover:text-white\">\n        <LogOut size={20} />\n        {open && <span className=\"text-sm\">Logout</span>}\n      </button>\n    </aside>\n  );\n}"},"/components/Header.tsx":{"code":"import React from \"react\";\nimport { Menu, Bell, User } from \"lucide-react\";\n\ninterface HeaderProps {\n  onMenuClick: () => void;\n}\n\nexport function Header({ onMenuClick }: HeaderProps) {\n  return (\n    <header className=\"bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center\">\n      <button onClick={onMenuClick} className=\"p-2 hover:bg-slate-100 rounded-lg\">\n        <Menu size={20} />\n      </button>\n      <div className=\"flex items-center gap-4\">\n        <button className=\"relative p-2 hover:bg-slate-100 rounded-lg\">\n          <Bell size={20} />\n          <span className=\"absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full\"></span>\n        </button>\n        <div className=\"flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg cursor-pointer\">\n          <User size={20} />\n          <span className=\"text-sm font-medium\">Admin</span>\n        </div>\n      </div>\n    </header>\n  );\n}"},"/components/KPICard.tsx":{"code":"import React from \"react\";\nimport { LucideIcon } from \"lucide-react\";\n\ninterface KPICardProps {\n  title: string;\n  value: string;\n  icon: LucideIcon;\n  trend: string;\n}\n\nexport function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {\n  return (\n    <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition\">\n      <div className=\"flex justify-between items-start mb-4\">\n        <div className=\"p-2 bg-indigo-50 rounded-lg text-indigo-600\">\n          <Icon size={24} />\n        </div>\n        <span className=\"text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded\">{trend}</span>\n      </div>\n      <h3 className=\"text-slate-600 text-sm font-medium\">{title}</h3>\n      <p className=\"text-2xl font-bold text-slate-900\">{value}</p>\n    </div>\n  );\n}"},"/components/Chart.tsx":{"code":"import React from \"react\";\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from \"recharts\";\n\nconst data = [\n  { month: \"Jan\", revenue: 45000 },\n  { month: \"Feb\", revenue: 52000 },\n  { month: \"Mar\", revenue: 48000 },\n  { month: \"Apr\", revenue: 61000 },\n  { month: \"May\", revenue: 55000 },\n  { month: \"Jun\", revenue: 67000 },\n];\n\nexport function Chart() {\n  return (\n    <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm\">\n      <h2 className=\"font-bold text-lg mb-4\">Revenue Trend</h2>\n      <ResponsiveContainer width=\"100%\" height={300}>\n        <LineChart data={data}>\n          <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#e2e8f0\" />\n          <XAxis dataKey=\"month\" stroke=\"#94a3b8\" />\n          <YAxis stroke=\"#94a3b8\" />\n          <Tooltip contentStyle={{ backgroundColor: \"#1e293b\", border: \"none\", borderRadius: \"8px\", color: \"white\" }} />\n          <Line type=\"monotone\" dataKey=\"revenue\" stroke=\"#4f46e5\" strokeWidth={2} dot={{ fill: \"#4f46e5\" }} />\n        </LineChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}"},"/components/MemberList.tsx":{"code":"import React from \"react\";\nimport { Check, Clock } from \"lucide-react\";\n\nconst members = [\n  { id: 1, name: \"John Smith\", status: \"Active\", checkedIn: \"10 mins ago\" },\n  { id: 2, name: \"Sarah Johnson\", status: \"Active\", checkedIn: \"2 hours ago\" },\n  { id: 3, name: \"Mike Davis\", status: \"Inactive\", checkedIn: \"Yesterday\" },\n  { id: 4, name: \"Emma Wilson\", status: \"Active\", checkedIn: \"5 mins ago\" },\n];\n\nexport function MemberList() {\n  return (\n    <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm\">\n      <h2 className=\"font-bold text-lg mb-4\">Recent Activity</h2>\n      <ul className=\"space-y-3\">\n        {members.map((member) => (\n          <li key={member.id} className=\"flex items-center justify-between p-3 bg-slate-50 rounded-lg\">\n            <div>\n              <p className=\"font-medium text-slate-900\">{member.name}</p>\n              <p className=\"text-xs text-slate-500 flex items-center gap-1\"><Clock size={12} /> {member.checkedIn}</p>\n            </div>\n            <span className={`text-xs font-bold px-2 py-1 rounded ${member.status === \"Active\" ? \"bg-green-100 text-green-700\" : \"bg-gray-100 text-gray-700\"}`}>\n              {member.status}\n            </span>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}"},"/lib/theme.ts":{"code":"export const theme = {\n  colors: {\n    primary: \"#4f46e5\",\n    secondary: \"#06b6d4\",\n    success: \"#10b981\",\n    warning: \"#f59e0b\",\n    danger: \"#ef4444\",\n    slate: { 50: \"#f8fafc\", 900: \"#0f172a\" },\n  },\n  spacing: { xs: \"0.25rem\", sm: \"0.5rem\", md: \"1rem\", lg: \"1.5rem\", xl: \"2rem\" },\n  radius: { sm: \"0.375rem\", md: \"0.5rem\", lg: \"1rem\" },\n};"},"/lib/hooks.ts":{"code":"import { useState, useCallback } from \"react\";\n\nexport const useFetch = <T,>(url: string, options?: RequestInit) => {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const fetch = useCallback(async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      const response = await globalThis.fetch(url, options);\n      if (!response.ok) throw new Error(`HTTP ${response.status}`);\n      const json = await response.json();\n      setData(json);\n    } catch (err) {\n      setError(err instanceof Error ? err.message : \"Unknown error\");\n    } finally {\n      setLoading(false);\n    }\n  }, [url, options]);\n\n  return { data, loading, error, fetch };\n};"},"/lib/utils.ts":{"code":"export const formatCurrency = (value: number): string => {\n  return new Intl.NumberFormat(\"en-US\", { style: \"currency\", currency: \"USD\" }).format(value);\n};\n\nexport const formatDate = (date: Date): string => {\n  return new Intl.DateTimeFormat(\"en-US\", { year: \"numeric\", month: \"short\", day: \"numeric\" }).format(date);\n};\n\nexport const clsx = (...classes: (string | boolean)[]): string => {\n  return classes.filter(Boolean).join(\" \");\n};"},"/types/index.ts":{"code":"export interface Member {\n  id: number;\n  name: string;\n  email: string;\n  status: \"active\" | \"inactive\" | \"trial\";\n  joinedDate: Date;\n}\n\nexport interface Class {\n  id: number;\n  name: string;\n  instructor: string;\n  time: string;\n  capacity: number;\n  enrolled: number;\n}\n\nexport interface DashboardMetrics {\n  activeMembers: number;\n  totalRevenue: number;\n  classesToday: number;\n  growthRate: number;\n}"},"generatedFiles":["/App.tsx","/components/Chart.tsx","/components/Header.tsx","/components/KPICard.tsx","/components/MemberList.tsx","/components/Sidebar.tsx","/lib/hooks.ts","/lib/theme.ts","/lib/utils.ts","/pages/Dashboard.tsx","/types/index.ts"]}',
      },
    ],
  },
];

export const createCodeGenerationChat = () => {
  return model.startChat({
    generationConfig: codeGenerationConfig,
    history: seededHistory,
  });
};
