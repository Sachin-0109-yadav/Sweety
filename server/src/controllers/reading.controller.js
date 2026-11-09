import {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} from "../repositories/reading.repository.js";

import {
  createReadingSchema,
  updateReadingSchema,
} from "../validators/reading.validator.js";

const handleDatabaseError = (error, res) => {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A reading already exists for this date and time slot",
    });
  }

  console.error("Reading API error:", error.message);

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred",
  });
};

// CREATE READING
export const addReading = async (req, res) => {
  const validation = createReadingSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid reading details",
      errors: validation.error.issues,
    });
  }

  try {
    const reading = await createReading({
      userId: req.user.userId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      message: "Glucose reading added successfully",
      data: { reading },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// GET ALL READINGS
export const listReadings = async (req, res) => {
  try {
    const readings = await getReadings(req.user.userId);

    return res.status(200).json({
      success: true,
      count: readings.length,
      data: { readings },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// GET SINGLE READING
export const getSingleReading = async (req, res) => {
  try {
    const reading = await getReadingById(
      req.user.userId,
      req.params.id
    );

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { reading },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// UPDATE READING
export const editReading = async (req, res) => {
  const validation = updateReadingSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid update details",
      errors: validation.error.issues,
    });
  }

  try {
    const reading = await updateReading(
      req.user.userId,
      req.params.id,
      validation.data
    );

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Glucose reading updated successfully",
      data: { reading },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// DELETE READING
export const removeReading = async (req, res) => {
  try {
    const deleted = await deleteReading(
      req.user.userId,
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Glucose reading deleted successfully",
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};