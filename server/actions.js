const prisma = require('./lib/prisma');

async function findChat(query) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        title: {
          contains: query.title,
          mode: 'insensitive'
        }
      },
      take: 20,
    });

    return { success: rooms };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const createChat = async (
  formData,
) => {
  try {
    const interests = JSON.parse(formData.interests);
    const locations = JSON.parse(formData.locations);
    if (!interests.length && !locations.length) {
      throw new Error('The room needs at least one reference point');
    }
    if (formData.title.length < 3) throw new Error('The title is too short');
    const room = await prisma.room.create({
      data: {
        title: formData.title,
        ids: [
          ...interests.map(x => x.id),
          ...locations.map(x => x.id)
        ],
        interests: interests,
        locations: locations,
      },
    });
    console.log(`Chat room ${room.id} has been created!`);

    return { success: room };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const updateChat = async (
  formData,
) => {
  try {
    const room = await prisma.room.update({
      where: {
        id: formData.roomId,
      },
      data: {
        content: formData.content,
      },
    });

    return { success: room };
  } catch(e) {
    console.error(e);
    return { error: e.message };
  }
}

const getChatById = async (params) => {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: params?.id,
      },
    });

    return { success: room };
  } catch(e) {
    console.error(e);
    return { error: e.message };
  }
}

const getChatRooms = async (params) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        ids: { has: params.prop }
      },
      select: {
        id: true,
        title: true,
      },
      take: 20,
    });

    return { success: rooms };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const joinChat = async (params, formData) => {
  try {
    const profile = JSON.parse(formData.profile);
    await prisma.$transaction(async (prisma) => {
      const room = await prisma.room.findUnique({
        where: { id: params.id },
      });
      if (room.limit > 0 && room.profiles.length >= room.limit) {
        throw new Error('Limit has been reached');
      }
      const exists = room.profiles.some(
        x => x.id === profile.id
      );
      if (!exists) {
        await prisma.room.update({
          where: { id: params.id },
          data: { profiles: { push: profile } },
        });
      }
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const leaveChat = async (params, formData) => {
  try {
    const profile = JSON.parse(formData.profile);
    await prisma.$transaction(async (prisma) => {
      const room = await prisma.room.findUnique({
        where: { id: params.id },
      });
      const updatedProfiles = room.profiles.filter(
        x => x.id !== profile.id,
      );
      await prisma.room.update({
        where: { id: params.id },
        data: { profiles: { set: updatedProfiles } },
      });
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

module.exports = {
  createChat,
  updateChat,
  getChatById,
  getChatRooms,
  joinChat,
  leaveChat,
};