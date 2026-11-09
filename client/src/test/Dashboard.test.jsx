
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import Dashboard from "../pages/Dashboard.jsx";
import api from "../services/api";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      name: "Sachin Yadav",
      email: "sachin@example.com",
    },
  }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-chart-points={data.length}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="chart-line" />,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const sampleReport = {
  summary: {
    totalReadings: 12,
    averageGlucose: 118.5,
    highestGlucose: 165,
    lowestGlucose: 85,
  },
  readings: [
    {
      id: "reading-1",
      reading_date: "2026-11-08",
      reading_slot: "Morning fasting",
      glucose_level: 105,
    },
    {
      id: "reading-2",
      reading_date: "2026-11-07",
      reading_slot: "After dinner",
      glucose_level: 145,
    },
  ],
};

const renderDashboard = () => render(<Dashboard />);

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockResolvedValue({
      data: {
        data: sampleReport,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the personalized greeting", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Welcome back, Sachin!")
    ).toBeInTheDocument();
  });

  it("loads and displays all four dashboard statistics", async () => {
    renderDashboard();

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("118.5")).toBeInTheDocument();
    expect(screen.getByText("165")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith(
      "/reports?period=monthToDate"
    );
  });

  it("displays recent glucose readings", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Morning fasting")
    ).toBeInTheDocument();

    expect(screen.getByText("After dinner")).toBeInTheDocument();
    expect(screen.getByText("105")).toBeInTheDocument();
    expect(screen.getByText("145")).toBeInTheDocument();
  });

  it("renders the glucose chart when readings exist", async () => {
    renderDashboard();

    expect(
      await screen.findByTestId("line-chart")
    ).toBeInTheDocument();

    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toHaveAttribute(
      "data-chart-points",
      "2"
    );
  });

  it("shows empty states when there are no readings", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          summary: {
            totalReadings: 0,
            averageGlucose: null,
            highestGlucose: null,
            lowestGlucose: null,
          },
          readings: [],
        },
      },
    });

    renderDashboard();

    expect(
      await screen.findByText("No readings to display yet")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No readings recorded this month.")
    ).toBeInTheDocument();

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows an API error when dashboard loading fails", async () => {
    api.get.mockRejectedValue({
      response: {
        data: {
          message: "Unable to load dashboard data",
        },
      },
    });

    renderDashboard();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load dashboard data");
  });

  it("retries loading dashboard data", async () => {
    api.get
      .mockRejectedValueOnce({
        response: {
          data: { message: "Temporary API error" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: sampleReport,
        },
      });

    renderDashboard();

    expect(
      await screen.findByText("Temporary API error")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Try again" })
    );

    expect(
      await screen.findByText("Welcome back, Sachin!")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it("refreshes dashboard data", async () => {
    renderDashboard();

    await screen.findByText("Welcome back, Sachin!");

    fireEvent.click(
      screen.getByRole("button", { name: /Refresh/i })
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
