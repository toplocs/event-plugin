const express = require('express');
const multer = require('multer');
const {
  findChats,
  createChat,
  updateChat,
  getChatById,
  getChatRooms,
  joinChat,
  leaveChat,
} = require('./actions');

const router = express.Router();
const upload = multer();

router.route('/').get(async (req, res) => {
  const { success, error } = await findChats(req.query);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})
.post(upload.none(), async (req, res) => {
  const { success, error } = await createChat(req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})
.put(upload.none(), async (req, res) => {
  const { success, error } = await updateChat(req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
})

router.route('/rooms/:prop').get(async (req, res) => {
  const { success, error } = await getChatRooms(req.params);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/join/:id').post(upload.none(), async (req, res) => {
  const { success, error } = await joinChat(req.params, req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/leave/:id').post(upload.none(), async (req, res) => {
  const { success, error } = await leaveChat(req.params, req.body);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});

router.route('/byId/:id').get(async (req, res) => {
  const { success, error } = await getChatById(req.params);

  if (success) return res.status(200).json(success);
  else return res.status(400).json(error);
});


module.exports = router;