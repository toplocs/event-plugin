const prisma = require('./lib/prisma');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_room', async ({ roomId}) => {
      try {
        const room = await prisma.room.findUnique({
          where: {
            id: roomId,
          },
          include: {
            messages: true,
          }
        });
        socket.join(roomId);
        socket.emit('join_room', { room: room });
      } catch(e) {
        console.error(e);
      }
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('message', async ({
      chatInput,
      roomId,
      user
    }) => {
      try {
        const msg = await prisma.message.create({
          data: {
            chatInput: chatInput,
            roomId: roomId,
            user: JSON.parse(user),
          }
        });
        io.to(String(roomId)).emit('message', { msg: msg });
      } catch(e) {
        console.error(e);
      }
    });

    socket.on('disconnect', () => {
      //leave room??
    });
  });
};
