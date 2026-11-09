
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Profile from "../pages/Profile";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUpdateUser = vi.fn();

const mockUser = {
  id: "user-123",
  name: "Sachin",
  email: "sachin@example.com",
  created_at: "2026-01-15T10:00:00.000Z",
};

const mockUpdatedUser = {
  ...mockUser,
  name: "Sachin Kumar",
};

const renderProfile = () => {
  return render(<Profile />);
};

describe("Profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });

    api.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: mockUser,
        },
      },
    });

    api.patch.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: mockUpdatedUser,
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays the user's profile", async () => {
    renderProfile();

    expect(await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    })).toBeInTheDocument();

    expect(
      screen.getByText("sachin@example.com", { selector: "p" })
    ).toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("displays account information and security status", async () => {
    renderProfile();

    expect(
      await screen.findByText("Account active")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Email address")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Member since")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Account security" })
    ).toBeInTheDocument();
  });

  it("synchronizes the loaded profile with authentication context", async () => {
    renderProfile();

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it("opens the edit profile form", async () => {
    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /edit profile/i })
    );

    expect(
      screen.getByRole("textbox", { name: /full name/i })
    ).toHaveValue("Sachin");

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("saves the updated name and synchronizes authentication context", async () => {
    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /edit profile/i })
    );

    const nameInput = screen.getByRole("textbox", {
      name: /full name/i,
    });

    fireEvent.change(nameInput, {
      target: { value: "  Sachin Kumar  " },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save changes/i })
    );

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        "/auth/profile",
        { name: "Sachin Kumar" }
      );
    });

    expect(
      await screen.findByRole("heading", {
        name: "Sachin Kumar",
        level: 2,
      })
    ).toBeInTheDocument();

    expect(mockUpdateUser).toHaveBeenLastCalledWith(
      mockUpdatedUser
    );

    expect(
      screen.getByText(
        "Your profile has been updated successfully."
      )
    ).toBeInTheDocument();
  });

  it("rejects a name shorter than two characters", async () => {
    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /edit profile/i })
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: /full name/i }),
      { target: { value: "A" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: /save changes/i })
    );

    expect(
      await screen.findByText(
        "Name must contain at least 2 characters."
      )
    ).toBeInTheDocument();

    expect(api.patch).not.toHaveBeenCalled();
  });

  it("cancels editing and restores the original name", async () => {
    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /edit profile/i })
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: /full name/i }),
      { target: { value: "Changed Name" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: /cancel/i })
    );

    expect(
      screen.getByRole("heading", {
        name: "Sachin",
        level: 2,
      })
    ).toBeInTheDocument();

    expect(api.patch).not.toHaveBeenCalled();
  });

  it("refreshes profile information", async () => {
    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /refresh/i })
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it("displays an error when profile loading fails", async () => {
    api.get.mockRejectedValueOnce({
      response: {
        data: {
          message: "Unable to load profile",
        },
      },
    });

    renderProfile();

    expect(
      await screen.findByText("Unable to load profile")
    ).toBeInTheDocument();
  });

  it("displays an error when profile saving fails", async () => {
    api.patch.mockRejectedValueOnce({
      response: {
        data: {
          message: "Unable to update profile",
        },
      },
    });

    renderProfile();

    await screen.findByRole("heading", {
      name: "Sachin",
      level: 2,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /edit profile/i })
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: /full name/i }),
      { target: { value: "Sachin Kumar" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: /save changes/i })
    );

    expect(
      await screen.findByText("Unable to update profile")
    ).toBeInTheDocument();

    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  });
});
