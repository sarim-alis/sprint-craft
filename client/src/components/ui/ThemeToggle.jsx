import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

const ThemeToggle = ({ className }) => {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-px hover:text-ink hover:shadow-[var(--shadow-soft)]",
        className
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
