import { Home, Users, Map, Bell, User } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface BottomNavProps {
  active: string;
  onChange: (screen: string) => void;
}

const navItems = [
  { id: "home", labelKey: "nav.home", defaultLabel: "Home", icon: Home },
  { id: "queue", labelKey: "nav.queue", defaultLabel: "Queue", icon: Users },
  { id: "map", labelKey: "nav.map", defaultLabel: "Map", icon: Map },
  { id: "alerts", labelKey: "nav.alerts", defaultLabel: "Alerts", icon: Bell },
  { id: "profile", labelKey: "nav.profile", defaultLabel: "Profile", icon: User },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useLanguage();
  return (
    <nav
      className="flex items-center justify-around bg-white border-t border-gray-100 px-2 pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)", paddingTop: "10px", height: "64px" }}
    >
      {navItems.map(({ id, labelKey, defaultLabel, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] relative"
          >
            {id === "alerts" && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white" style={{ fontSize: "9px", fontFamily: "Poppins, sans-serif" }}>2</span>
              </span>
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              color={isActive ? "#C84B31" : "#9ca3af"}
            />
            <span
              style={{
                fontSize: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#C84B31" : "#9ca3af",
              }}
            >
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
