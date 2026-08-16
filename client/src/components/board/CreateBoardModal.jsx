import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Input, Textarea } from "../ui/Input";
import { useBoards } from "../../context/BoardsContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

// Earthy palette that complements the forest-green theme.
const COLORS = [
  "#2f8159", // forest (brand default)
  "#2c9c8f", // teal
  "#6f9b54", // olive / sage
  "#d4a23c", // amber
  "#c26a45", // terracotta
  "#5f7da6", // slate blue
];

const emptyForm = () => ({ title: "", description: "", color: COLORS[0] });

const CreateBoardModal = ({ open, onClose, board = null }) => {
  const { create, update, remove } = useBoards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = Boolean(board);
  const canDelete = isEdit && (board.is_owner || board.owner_id === user?.id);

  useEffect(() => {
    if (!open) {
      setConfirmDelete(false);
      return;
    }
    if (board) {
      setForm({
        title: board.title || "",
        description: board.description || "",
        color: board.color || COLORS[0],
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, board]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await update(board.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          color: form.color,
        });
        toast.success("Board updated");
        onClose();
      } else {
        const created = await create(form);
        toast.success("Board created");
        onClose();
        setForm(emptyForm());
        navigate(`/board/${created.id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await remove(board.id);
      toast.success(`${board.title} deleted`);
      setConfirmDelete(false);
      onClose();
      if (location.pathname.includes(`/board/${board.id}`)) {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "Edit board" : "Create a board"}
        description={
          isEdit
            ? "Update the name, description, or accent color."
            : "Boards start with Todo, In Progress, Review and Done."
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Board name"
            placeholder="Product Roadmap"
            autoFocus
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            rows={3}
            placeholder="What is this board about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted">Accent color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform",
                    form.color === c ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-surface" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            {canDelete ? (
              <Button type="button" variant="ghost" className="text-priority-urgent" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={loading}>{isEdit ? "Save changes" : "Create board"}</Button>
            </div>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete board?"
        description={`“${board?.title}” and all of its columns and tasks will be permanently removed. This can’t be undone.`}
        confirmLabel="Delete board"
        danger
        loading={deleting}
      />
    </>
  );
};

export default CreateBoardModal;
