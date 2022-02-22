const express = require("express");
const activitiesRouter = express.Router();
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post("/", async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const newActivity = await createActivity({ name, description });
    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});
// PATCH /activities/:activityId (*)
// Anyone can update an activity (yes, this could lead to long term problems a la wikipedia)
activitiesRouter.patch("/:activityId", async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;

  try {
    const newActivity = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(newActivity);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /activities/:activityId/routines
// Get a list of all public routines which feature that activity
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;
  try {
    const routines = await getPublicRoutinesByActivity({ activityId });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
