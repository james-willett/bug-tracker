import { useState, useEffect } from "react";
import { Bug, Priority } from "@/types/bug";

interface AddBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bug: Omit<Bug, "id" | "status">) => void;
}

const initialFormData = {
  title: "",
  description: "",
  priority: "Medium" as const,
};

export default function AddBugModal({
  isOpen,
  onClose,
  onSubmit,
}: AddBugModalProps) {
  const [formData, setFormData] =
    useState<Omit<Bug, "id" | "status">>(initialFormData);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="add-bug-modal"
      className={`fixed inset-0 bg-black/50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <form
          data-testid="add-bug-form"
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4">Add New Bug</h2>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="priority"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              value={formData.priority}
              onChange={(e) => {
                const value = e.target.value as Priority;
                setFormData({ ...formData, priority: value });
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Bug
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
