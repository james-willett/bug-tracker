import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "./CommentSection";
import { Comment } from "@/types/comment";

global.fetch = jest.fn();

describe("CommentSection", () => {
  const mockComments: Comment[] = [
    {
      id: "1",
      bugId: "1",
      author: "John Doe",
      content: "This is a test comment",
      createdAt: "2023-06-10T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the comment section with existing comments", () => {
    render(
      <CommentSection
        bugId={1}
        comments={mockComments}
        onCommentAdded={jest.fn()}
      />
    );
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  it("should submit a new comment", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const onCommentAdded = jest.fn();
    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={onCommentAdded} />
    );

    await userEvent.type(screen.getByLabelText("Your Name"), "Jane Smith");
    await userEvent.type(
      screen.getByLabelText("Comment"),
      "This is a new comment"
    );
    fireEvent.click(screen.getByText("Add Comment"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/bugs/1/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            author: "Jane Smith",
            content: "This is a new comment",
          }),
        }
      );
      expect(onCommentAdded).toHaveBeenCalled();
    });
  });

  it("should handle error when submitting a comment", async () => {
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to add comment")
    );

    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );

    await userEvent.type(screen.getByLabelText("Your Name"), "Jane Smith");
    await userEvent.type(
      screen.getByLabelText("Comment"),
      "This is a new comment"
    );
    fireEvent.click(screen.getByText("Add Comment"));

    await waitFor(() => {
      expect(screen.getByText("Add Comment")).toBeInTheDocument();
    });

    consoleErrorMock.mockRestore();
  });

  it("should render empty comments message when no comments are provided", () => {
    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("should disable the submit button when form fields are empty", () => {
    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );
    expect(screen.getByText("Add Comment")).toBeDisabled();
  });

  it("should display the correct timestamp for each comment", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-06-10T11:00:00.000Z"));

    render(
      <CommentSection
        bugId={1}
        comments={mockComments}
        onCommentAdded={jest.fn()}
      />
    );

    // expect(screen.getByText(/6\/10\/23.*(10|11):00:00/)).toBeInTheDocument();
    // expect(screen.getByText(/6\/10\/23.*PM/)).toBeInTheDocument();
    expect(screen.getByText(/6\/10\/23, 10:00:00 AM/)).toBeInTheDocument();

    jest.useRealTimers();
  });
});
