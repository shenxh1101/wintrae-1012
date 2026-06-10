import { NavLink, useLocation } from "react-router-dom";
import {
  GalleryVerticalEnd,
  ClipboardList,
  Truck,
  Route,
  FolderKanban,
} from "lucide-react";
import { cn } from "../../utils";

const navItems = [
  { path: "/artworks", label: "展品档案", icon: GalleryVerticalEnd },
  { path: "/applications", label: "借展申请", icon: ClipboardList },
  { path: "/transportation", label: "运输安排", icon: Truck },
  { path: "/tracking", label: "状态追踪", icon: Route },
  { path: "/documents", label: "文档中心", icon: FolderKanban },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 shrink-0 h-screen bg-ink border-r border-ink-700 flex flex-col sticky top-0">
      <div className="px-6 py-8 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-gallery bg-gold-400 flex items-center justify-center">
            <GalleryVerticalEnd className="w-5 h-5 text-ink" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-lg text-cream-100 tracking-wide leading-none">
              艺境
            </h1>
            <p className="text-[10px] text-ink-300 mt-1 tracking-widest uppercase">
              Gallery Loan System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 rounded-gallery text-sm transition-all duration-200",
                isActive
                  ? "bg-gold-400 text-ink font-medium"
                  : "text-ink-200 hover:bg-ink-700 hover:text-cream"
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span className="tracking-wide">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-ink" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-300 font-display text-sm">
            L
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-cream-100 truncate">李馆长</p>
            <p className="text-[11px] text-ink-300">美术馆馆员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
