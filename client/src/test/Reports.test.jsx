
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

import { MemoryRouter } from "react-router-dom";
import Reports from "../pages/Reports.jsx";
import api from "../services/api";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
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

const renderReports = () =>
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );

describe("Reports page", () => {
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

  it("loads the monthly report by default", async () => {
    renderReports();

    expect(
      await screen.findByRole("heading", {
        name: "Health Reports",
      })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/reports?period=monthToDate"
      );
    });
  });

  it("displays all four report statistics", async () => {
    renderReports();

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("118.5")).toBeInTheDocument();
    expect(screen.getByText("165")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("displays the glucose trend chart", async () => {
    renderReports();

    expect(
      await screen.findByTestId("line-chart")
    ).toBeInTheDocument();

    expect(screen.getByTestId("chart-line")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toHaveAttribute(
      "data-chart-points",
      "2"
    );
  });

  it("displays the reading history table", async () => {
    renderReports();

    expect(
      await screen.findByText("Morning fasting")
    ).toBeInTheDocument();

    expect(screen.getByText("After dinner")).toBeInTheDocument();
    expect(screen.getByText("08/11/2026")).toBeInTheDocument();
    expect(screen.getByText("07/11/2026")).toBeInTheDocument();
    expect(screen.getByText("105")).toBeInTheDocument();
    expect(screen.getByText("145")).toBeInTheDocument();
  });

  it("loads the daily report when Today is selected", async () => {
    renderReports();

    await screen.findByText("Morning fasting");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Select report period",
      }),
      { target: { value: "daily" } }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith(
        "/reports?period=daily"
      );
    });
  });

  it("loads the previous month report when selected", async () => {
    renderReports();

    await screen.findByText("Morning fasting");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Select report period",
      }),
      { target: { value: "previousMonth" } }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith(
        "/reports?period=previousMonth"
      );
    });

    expect(
  screen.getByRole("combobox", {
    name: "Select report period",
  })
).toHaveValue("previousMonth");
  });

  it("shows empty states when the selected period has no readings", async () => {
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

    renderReports();

    expect(
      await screen.findByText("No readings available")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No readings found for this period.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Add a glucose reading",
      })
    ).toHaveAttribute("href", "/readings");

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows an error when report loading fails", async () => {
    api.get.mockRejectedValue({
      response: {
        data: {
          message: "Unable to load report data",
        },
      },
    });

    renderReports();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load report data");
  });

  it("retries report loading after an API error", async () => {
    api.get
      .mockRejectedValueOnce({
        response: {
          data: { message: "Temporary report error" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: sampleReport,
        },
      });

    renderReports();

    expect(
      await screen.findByText("Temporary report error")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Try again" })
    );

    expect(
      await screen.findByText("Morning fasting")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it("refreshes the currently selected report", async () => {
    renderReports();

    await screen.findByText("Morning fasting");

    fireEvent.click(
      screen.getByRole("button", { name: /Refresh/i })
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
