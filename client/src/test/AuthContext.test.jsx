
import { render, screen, fireEvent } from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import api from "../services/api";
import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext.jsx";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function AuthStatus() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>{isAuthenticated ? user.name : "Signed out"}</p>

      <button
        onClick={() =>
          login({
            email: "test@example.com",
            password: "password123",
          })
        }
      >
        Login
      </button>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows signed-out state when no token exists", async () => {
    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    );

    expect(await screen.findByText("Signed out")).toBeInTheDocument();
  });

  it("logs in successfully and stores the token", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
          token: "test-jwt-token",
        },
      },
    });

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    );

    await screen.findByText("Signed out");

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(localStorage.getItem("sweety_token")).toBe("test-jwt-token");
  });

  it("logs out and removes the saved token", async () => {
    localStorage.setItem("sweety_token", "old-token");

    api.get.mockRejectedValue(new Error("Session expired"));

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    );

    await screen.findByText("Signed out");

    api.post.mockResolvedValue({
      data: {
        data: {
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
          token: "test-jwt-token",
        },
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Test User")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(await screen.findByText("Signed out")).toBeInTheDocument();
    expect(localStorage.getItem("sweety_token")).toBeNull();
  });
});
