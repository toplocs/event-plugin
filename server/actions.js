const prisma = require('./lib/prisma');

async function findEvent(query) {
  try {
    const events = await prisma.event.findMany({
      where: {
        title: {
          contains: query.title,
          mode: 'insensitive'
        }
      },
      take: 20,
    });

    return { success: events };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const createEvent = async (
  formData,
) => {
  try {
    if (formData.title.length < 3) throw new Error('The title is too short');
    const event = await prisma.event.create({
      data: {
        title: formData.title,
        description: formData.description,
        recurring: Number(formData.recurring),
        limit: Number(formData.limit),
        date: new Date(formData.date),
        interests: JSON.parse(formData.interests),
        locations: JSON.parse(formData.locations),
      },
    });
    console.log(`Event ${event.title} has been created!`)

    return { success: event };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const updateEvent = async (
  formData,
) => {
  try {
    const event = await prisma.event.update({
      where: {
        id: formData.eventId,
      },
      data: {
        content: formData.content,
      },
    });

    return { success: event };
  } catch(e) {
    console.error(e);
    return { error: e.message };
  }
}

const getEventById = async (params) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: params?.id,
      },
    });

    return { success: event };
  } catch(e) {
    console.error(e);
    return { error: e.message };
  }
}

const getEventPages = async (params) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { interests: { has: params?.prop } },
          { locations: { has: params?.prop } },
        ],
        date: { gte: new Date() }
      },
      take: 20,
    });

    return { success: events };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

const joinEvent = async (params, formData) => {
  try {
    const profile = JSON.parse(formData.profile);
    await prisma.$transaction(async (prisma) => {
      const event = await prisma.event.findUnique({
        where: { id: params.id },
      });
      if (event.limit > 0 && event.profiles.length >= event.limit) {
        throw new Error('Limit has been reached');
      }
      const exists = event.profiles.some(
        x => x.id === profile.id
      );
      if (!exists) {
        await prisma.event.update({
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

const leaveEvent = async (params, formData) => {
  try {
    const profile = JSON.parse(formData.profile);
    await prisma.$transaction(async (prisma) => {
      const event = await prisma.event.findUnique({
        where: { id: params.id },
      });
      const updatedProfiles = event.profiles.filter(
        x => x.id !== profile.id,
      );
      await prisma.event.update({
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
  createEvent,
  updateEvent,
  getEventById,
  getEventPages,
  joinEvent,
  leaveEvent,
};