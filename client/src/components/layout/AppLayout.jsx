import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BoardsProvider } from "../../context/BoardsContext";
import { cn } from "../../lib/utils";
import Sidebar from "./Sidebar";
import CreateBoardModal from "../board/CreateBoardModal";
import CommandMenu from "../CommandMenu";

const LayoutContext = createContext(null);
export const useLayout = () => useContext(LayoutContext);

const LayoutInner = () => {
  const [boardModal, setBoardModal] = useState({ open: false, board: null });
  const [commandOpen, setCommandOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const openCreateBoard = useCallback(() => setBoardModal({ open: true, board: null }), []);
  const openEditBoard = useCallback((board) => setBoardModal({ open: true, board }), []);
  const closeBoardModal = useCallback(() => setBoardModal({ open: false, board: null }), []);
  const openCommand = useCallback(() => setCommandOpen(true), []);
  const toggleSidebar = useCallback(
    () =>
      setCollapsed((c) => {
        const next = !c;
        localStorage.setItem("sidebar-collapsed", String(next));
        return next;
      }),
    []
  );

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LayoutContext.Provider value={{ openCreateBoard, openEditBoard, openCommand }}>
      <div className="h-screen overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onCreateBoard={openCreateBoard}
        />
        <main
          className={cn(
            "flex h-screen min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ease-[var(--ease-spring)]",
            collapsed ? "md:pl-[92px]" : "md:pl-[280px]"
          )}
        >
          <Outlet />
        </main>
      </div>

      <CreateBoardModal
        open={boardModal.open}
        board={boardModal.board}
        onClose={closeBoardModal}
      />
      <CommandMenu
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onCreateBoard={() => {
          setCommandOpen(false);
          setBoardModal({ open: true, board: null });
        }}
      />
    </LayoutContext.Provider>
  );
};

const AppLayout = () => (
  <BoardsProvider>
    <LayoutInner />
  </BoardsProvider>
);

export default AppLayout;
