
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../src/config/db.js", () => ({
  default: {
    query: mockQuery,
  },
}));

const { getReportData } = await import(
  "../src/repositories/report.repository.js"
);

describe("Report repository ownership", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [{}] });
  });

  it("filters report summary by authenticated user ID", async () => {
    await getReportData("user-1", "daily");

    expect(mockQuery.mock.calls[0][0]).toContain(
      "WHERE user_id = $1"
    );
    expect(mockQuery.mock.calls[0][1]).toEqual(["user-1"]);
  });

  it("filters report readings by authenticated user ID", async () => {
    await getReportData("user-1", "daily");

    expect(mockQuery.mock.calls[1][0]).toContain(
      "WHERE user_id = $1"
    );
    expect(mockQuery.mock.calls[1][1]).toEqual(["user-1"]);
  });

  it("rejects an invalid report period", async () => {
    await expect(
      getReportData("user-1", "invalid")
    ).rejects.toThrow("Invalid report period");

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns summary and readings for the requested period", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ total_readings: 2, average_glucose: "110.0" }],
      })
      .mockResolvedValueOnce({
        rows: [{ glucose_level: 105 }, { glucose_level: 115 }],
      });

    const result = await getReportData("user-1", "monthToDate");

    expect(result.summary.total_readings).toBe(2);
    expect(result.readings).toHaveLength(2);
  });
});
