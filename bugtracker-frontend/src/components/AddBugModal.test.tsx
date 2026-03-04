import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddBugModal from "./AddBugModal";

describe("AddBugModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<AddBugModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Add New Bug")).not.toBeInTheDocument();
  });

  it("should render the modal when isOpen is true", () => {
    render(<AddBugModal {...defaultProps} />);
    expect(screen.getByText("Add New Bug")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
  });

  it("should handle form submission with correct data", async () => {
    render(<AddBugModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText("Title"), "Test Bug");
    await userEvent.type(
      screen.getByLabelText("Description"),
      "Test Description"
    );
    await userEvent.selectOptions(screen.getByLabelText("Priority"), "High");

    fireEvent.submit(screen.getByRole("button", { name: "Add Bug" }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "Test Bug",
      description: "Test Description",
      priority: "High",
    });
    expect(mockOnClose).toHaveBeenCalled();
  }, 60000);

  it("should close modal when Cancel button is clicked", () => {
    render(<AddBugModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should update form data when inputs change", async () => {
    render(<AddBugModal {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const prioritySelect = screen.getByLabelText("Priority");

    await userEvent.type(titleInput, "New Bug");
    await userEvent.type(descriptionInput, "New Description");
    await userEvent.selectOptions(prioritySelect, "Low");

    expect(titleInput).toHaveValue("New Bug");
    expect(descriptionInput).toHaveValue("New Description");
    expect(prioritySelect).toHaveValue("Low");
  });

  it("should not submit form with empty required fields", async () => {
    render(<AddBugModal {...defaultProps} />);

    fireEvent.submit(screen.getByRole("button", { name: "Add Bug" }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Title"), "Test Bug");
    fireEvent.submit(screen.getByRole("button", { name: "Add Bug" }));
    expect(mockOnSubmit).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByLabelText("Title"));
    await userEvent.type(
      screen.getByLabelText("Description"),
      "Test Description"
    );
    fireEvent.submit(screen.getByRole("button", { name: "Add Bug" }));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should have default Medium priority", () => {
    render(<AddBugModal {...defaultProps} />);
    expect(screen.getByLabelText("Priority")).toHaveValue("Medium");
  });

  it("should reset form data after closing and reopening", () => {
    const { rerender } = render(<AddBugModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test Bug" },
    });

    rerender(<AddBugModal {...defaultProps} isOpen={false} />);

    rerender(<AddBugModal {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText("Title")).toHaveValue("");
  });
});
