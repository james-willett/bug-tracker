import { createBug, getBugs, updateBug, deleteBug } from "@/api/bugs";

global.fetch = jest.fn();

describe("Bug API", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getBugs", () => {
    it("should fetch bugs successfully", async () => {
      const mockBugs = [
        {
          id: 1,
          title: "Bug 1",
          description: "Description 1",
          status: "Open" as const,
          priority: "High" as const,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBugs,
      });

      const result = await getBugs();
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8081/api/bugs"
      );
      expect(result).toEqual(mockBugs);
    });

    it("should handle network errors when fetching bugs", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(getBugs()).rejects.toThrow("Network error");
    });

    it("should handle invalid JSON responses when fetching bugs", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });
      await expect(getBugs()).rejects.toThrow("Invalid JSON");
    });
  });

  describe("createBug", () => {
    const mockBug = {
      title: "Test Bug",
      description: "Test Description",
      priority: "High" as const,
      status: "Open" as const,
    };

    it("should create a new bug successfully", async () => {
      const mockResponse = {
        id: 1,
        ...mockBug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createBug(mockBug);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8081/api/bugs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBug),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors when creating a bug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid bug data" }),
      });
      await expect(createBug(mockBug)).rejects.toThrow("Failed to create bug");
    });

    it("should handle network errors when creating a bug", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );
      await expect(createBug(mockBug)).rejects.toThrow("Network error");
    });

    it("should handle invalid JSON responses when creating a bug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });
      await expect(createBug(mockBug)).rejects.toThrow("Invalid JSON");
    });
  });

  describe("updateBug", () => {
    const mockBug = {
      id: 1,
      title: "Updated Bug",
      description: "Updated Description",
      status: "In Progress" as const,
      priority: "Medium" as const,
    };

    it("should update a bug successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBug,
      });

      const result = await updateBug("1", mockBug);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8081/api/bugs/1",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBug),
        }
      );
      expect(result).toEqual(mockBug);
    });

    it("should handle not found error when updating a bug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Bug not found" }),
      });
      await expect(updateBug("999", mockBug)).rejects.toThrow(
        "Failed to update bug"
      );
    });

    it("should handle network errors when updating a bug", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );
      await expect(updateBug("1", mockBug)).rejects.toThrow("Network error");
    });

    it("should handle invalid JSON responses when updating a bug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });
      await expect(updateBug("1", mockBug)).rejects.toThrow("Invalid JSON");
    });
  });

  describe("deleteBug", () => {
    it("should delete a bug successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await deleteBug("1");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8081/api/bugs/1",
        {
          method: "DELETE",
        }
      );
    });

    it("should handle not found error when deleting a bug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Bug not found" }),
      });
      await expect(deleteBug("999")).rejects.toThrow("Failed to delete bug");
    });

    it("should handle network errors when deleting a bug", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );
      await expect(deleteBug("1")).rejects.toThrow("Network error");
    });
  });
});
