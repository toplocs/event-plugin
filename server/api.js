const express = require('express');
const multer = require('multer');
const {
  findEvents,
  createEvent,
  updateEvent,
  getEventById,
  getEventPages,
  joinEvent,
  leaveEvent,
} = require('./actions');

const router = express.Router();
const upload = multer();

router.route('/').get(async (req, res) => {
  const { success, error } = await findEvents(req.query);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})
.post(upload.none(), async (req, res) => {
  const { success, error } = await createEvent(req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})
.put(upload.none(), async (req, res) => {
  const { success, error } = await updateEvent(req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})

router.route('/pages/:prop').get(async (req, res) => {
  const { success, error } = await getEventPages(req.params);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/join/:id').post(upload.none(), async (req, res) => {
  const { success, error } = await joinEvent(req.params, req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/leave/:id').post(upload.none(), async (req, res) => {
  const { success, error } = await leaveEvent(req.params, req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/byId/:id').get(async (req, res) => {
  const { success, error } = await getEventById(req.params);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});


module.exports = router;