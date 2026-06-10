import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Bell, Search } from "lucide-react";

const routeTitles: Record<string, { title: string; parent?: string }> = {
  "/artworks": { title: "展品档案" },
  "/applications": { title: "借展申请" },
  "/transportation": { title: "运输安排" },
  "/tracking": { title: "状态追踪" },
  "/documents": { title: "文档中心" },
};

export function Header() {
  const location = useLocation();
  const path = location.pathname.split("/").filter(Boolean);
  const basePath = "/" + path[0];
  const current = routeTitles[basePath] || { title: "首页" };

  return (
    <header className="h-16 border-b border-ink/8 bg-white/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/artworks" className="text-ink/40 hover:text-ink transition-colors">
          首页
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink/20" strokeWidth={2} />
        <span className="text-ink font-medium">{current.title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="全局搜索…"
            className="w-64 pl-9 pr-4 py-2 rounded-gallery border border-ink/10 bg-cream-50 text-sm placeholder-ink/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all"
          />
        </div>
        <button className="relative w-9 h-9 rounded-gallery border border-ink/10 flex items-center justify-center text-ink/60 hover:text-ink hover:border-ink/20 transition-all">
          <Bell className="w-4 h-4" strokeWidth={1.75} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-terracotta-400" />
        </button>
      </div>
    </header>
  );
}
