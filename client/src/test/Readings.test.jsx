
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
import Readings from "../pages/Readings.jsx";
import api from "../services/api";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const sampleReadings = [
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
];

const renderReadings = () =>
  render(
    <MemoryRouter>
      <Readings />
    </MemoryRouter>
  );

describe("Readings page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: {
          readings: sampleReadings,
        },
      },
    });
    api.post.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
    api.delete.mockResolvedValue({ data: { success: true } });
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays glucose readings", async () => {
    renderReadings();

    expect(
      await screen.findByText("Morning fasting")
    ).toBeInTheDocument();

    expect(screen.getByText("105")).toBeInTheDocument();
    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows an empty state when there are no readings", async () => {
    api.get.mockResolvedValue({
      data: { data: { readings: [] } },
    });

    renderReadings();

    expect(
      await screen.findByText("No readings found")
    ).toBeInTheDocument();
  });

  it("shows an error when readings cannot be loaded", async () => {
    api.get.mockRejectedValue({
      response: {
        data: { message: "Unable to load readings" },
      },
    });

    renderReadings();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load readings");
  });

  it("filters readings by reading type", async () => {
    renderReadings();

    await screen.findByText("Morning fasting");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Filter by reading type",
      }),
      { target: { value: "After dinner" } }
    );

    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.queryByText("105")).not.toBeInTheDocument();
  });

  it("searches readings by reading type", async () => {
    renderReadings();

    await screen.findByText("Morning fasting");

    fireEvent.change(
      screen.getByPlaceholderText("Search date or reading type..."),
      { target: { value: "dinner" } }
    );

    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.queryByText("105")).not.toBeInTheDocument();
  });

  it("adds a new glucose reading", async () => {
    renderReadings();

    await screen.findByText("Morning fasting");

    fireEvent.click(
      screen.getByRole("button", { name: /Add reading/i })
    );

    fireEvent.change(screen.getByLabelText("Reading date"), {
      target: { value: "2026-11-09" },
    });

    fireEvent.change(screen.getByLabelText("Reading type"), {
      target: { value: "After breakfast" },
    });

    fireEvent.change(screen.getByLabelText("Glucose level (mg/dL)"), {
      target: { value: "120" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Save reading" })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/readings", {
        reading_date: "2026-11-09",
        reading_slot: "After breakfast",
        glucose_level: 120,
      });
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("Glucose reading added successfully.");
  });

  it("edits an existing glucose reading", async () => {
    renderReadings();

    await screen.findByText("Morning fasting");

    const editButtons = screen.getAllByRole("button", {
      name: "Edit reading",
    });

    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText("Glucose level (mg/dL)"), {
      target: { value: "115" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Save changes" })
    );

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/readings/reading-1",
        expect.objectContaining({
          glucose_level: 115,
        })
      );
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("Glucose reading updated successfully.");
  });

  it("deletes a reading after confirmation", async () => {
    renderReadings();

    await screen.findByText("Morning fasting");

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete reading",
    });

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        "/readings/reading-1"
      );
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("Reading deleted successfully.");
  });
});
