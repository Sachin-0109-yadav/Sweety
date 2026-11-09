
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

const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} = await import("../src/repositories/reading.repository.js");

describe("Reading repository ownership", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  it("assigns a new reading to the specified user", async () => {
    await createReading({
      userId: "user-1",
      reading_date: "2026-11-09",
      reading_slot: "Morning fasting",
      glucose_level: 105,
    });

    expect(mockQuery.mock.calls[0][0]).toContain("user_id");
    expect(mockQuery.mock.calls[0][1][0]).toBe("user-1");
  });

  it("filters the reading list by user ID", async () => {
    await getReadings("user-1");

    expect(mockQuery.mock.calls[0][0]).toContain(
      "WHERE user_id = $1"
    );
    expect(mockQuery.mock.calls[0][1]).toEqual(["user-1"]);
  });

  it("checks user ID when retrieving one reading", async () => {
    await getReadingById("user-1", "reading-1");

    expect(mockQuery.mock.calls[0][0]).toContain(
      "WHERE user_id = $1 AND id = $2"
    );
    expect(mockQuery.mock.calls[0][1]).toEqual([
      "user-1",
      "reading-1",
    ]);
  });

  it("checks user ID when updating a reading", async () => {
    await updateReading("user-1", "reading-1", {
      glucose_level: 110,
    });

    expect(mockQuery.mock.calls[0][0]).toContain(
      "WHERE user_id = $2"
    );
    expect(mockQuery.mock.calls[0][1]).toEqual([
      110,
      "user-1",
      "reading-1",
    ]);
  });

  it("checks user ID when deleting a reading", async () => {
    await deleteReading("user-1", "reading-1");

    expect(mockQuery.mock.calls[0][0]).toContain(
      "WHERE user_id = $1 AND id = $2"
    );
    expect(mockQuery.mock.calls[0][1]).toEqual([
      "user-1",
      "reading-1",
    ]);
  });
});
