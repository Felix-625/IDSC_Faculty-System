const express = require("express");
const router = express.Router();

const announcementService = require("../services/announcement.service");
const { authenticate, requireRole } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");
const { validateAnnouncement, pickAnnouncement } = require("../utils/validators");

const notFound = (req, res) =>
  sendProblem(req, res, 404, `Announcement ${req.params.announcementId} was not found.`);

router.use(authenticate);

router.get("/", (req, res) => {
  res.json(announcementService.getAnnouncements());
});

router.post("/", requireRole("DEAN"), (req, res) => {
  const data = pickAnnouncement(req.body || {});

  const errors = validateAnnouncement(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  res.status(201).json(announcementService.createAnnouncement(data, req.user));
});

router.get("/:announcementId", (req, res) => {
  const item = announcementService.getAnnouncementById(req.params.announcementId);
  if (!item) return notFound(req, res);
  res.json(item);
});

router.put("/:announcementId", requireRole("DEAN"), (req, res) => {
  const data = pickAnnouncement(req.body || {});

  const errors = validateAnnouncement(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const updated = announcementService.updateAnnouncement(req.params.announcementId, data);
  if (!updated) return notFound(req, res);
  res.json(updated);
});

router.delete("/:announcementId", requireRole("DEAN"), (req, res) => {
  if (!announcementService.deleteAnnouncement(req.params.announcementId)) return notFound(req, res);
  res.status(204).send();
});

module.exports = router;