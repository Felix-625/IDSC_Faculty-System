const announcements = require("../data/announcement.data");

function nextAnnouncementId() {
  const max = announcements.reduce((highest, a) => {
    const n = parseInt(String(a.announcementId).replace("ANN-", ""), 10);
    return Number.isNaN(n) ? highest : Math.max(highest, n);
  }, 0);
  return `ANN-${String(max + 1).padStart(3, "0")}`;
}

// Newest first.
function getAnnouncements() {
  return [...announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getAnnouncementById(id) {
  return announcements.find(a => a.announcementId === id);
}

// postedBy / postedByPosition come from the logged-in user, never from the request body.
function createAnnouncement({ title, content }, user) {
  const item = {
    announcementId: nextAnnouncementId(),
    title,
    content,
    postedBy: user.facultyId,
    postedByPosition: user.role,
    createdAt: new Date().toISOString()
  };
  announcements.push(item);
  return item;
}

function updateAnnouncement(id, { title, content }) {
  const item = getAnnouncementById(id);
  if (!item) return null;
  item.title = title;
  item.content = content;
  item.updatedAt = new Date().toISOString();
  return item;
}

function deleteAnnouncement(id) {
  const index = announcements.findIndex(a => a.announcementId === id);
  if (index === -1) return false;
  announcements.splice(index, 1);
  return true;
}

module.exports = {
  getAnnouncements, getAnnouncementById,
  createAnnouncement, updateAnnouncement, deleteAnnouncement
};