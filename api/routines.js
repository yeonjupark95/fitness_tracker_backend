const express = require("express");
const { user } = require("pg/lib/defaults");
const routinesRouter = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  getRoutineById,
  destroyRoutine,
} = require("../db/routines");
const { addActivityToRoutine } = require("./routine_activities");
const { requireUser } = require("./utils");

routinesRouter.get("/", async (req, res, next) => {
  try {
    const publicRoutines = await getAllPublicRoutines();
    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/", async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  try {
    const newRoutine = await createRoutine({
      creatorId: req.user.id,
      name,
      isPublic,
      goal,
    });
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});
// PATCH /routines/:routineId (**)
// Update a routine, notably change public/private, the name, or the goal
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;

  try {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId === req.user.id) {
      const updatedRoutine = await updateRoutine({
        id: routineId,
        isPublic,
        name,
        goal,
      });
      res.send(updatedRoutine);
      return;
    } else {
      next({
        name: "updateRoutineError",
        message: "You must be logged in",
      });
    }
  } catch (error) {
    next(error);
  }
});
// DELETE /routines/:routineId (**)
// Hard delete a routine. Make sure to delete all the routineActivities whose routine is the one being deleted.
routinesRouter.delete("/:routineId", requireUser, async (res, req, next) => {
  const { routineId } = req.params;
  try {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId === req.user.id) {
      const deletedRoutine = await destroyRoutine(routineId);
      res.send(deletedRoutine);
      return;
    } else {
      next({
        name: "deleteCreatorIdError",
        message: "You must be the creator of this routine",
      });
    }
  } catch (error) {
    next(error);
  }
});
// POST /routines/:routineId/activities
// Attach a single activity to a routine. Prevent duplication on (routineId, activityId) pair.
routinesRouter.post(":routineId/activities", async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;
  try {
    const routineActivity = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });
    res.send(routineActivity);
  } catch (error) {
    next(error);
  }
});
module.exports = routinesRouter;
