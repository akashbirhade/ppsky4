import prisma from '../config/prisma';

type HostStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
const db = prisma as any;

// ─── HOST CRUD ──────────────────────────────────────────────────────────────

export const createHost = async (data: {
  name: string;
  mobile: string;
  email: string;
  region: string;
  district: string;
  city: string;
  community?: string;
  profilePhoto?: string;
}) => {
  return db.host.create({ data });
};

export const getHosts = async (filters: {
  region?: string;
  district?: string;
  city?: string;
  status?: HostStatus;
  page?: number;
  limit?: number;
}) => {
  const { region, district, city, status, page = 1, limit = 20 } = filters;
  const where: any = {};
  if (region) where.region = region;
  if (district) where.district = district;
  if (city) where.city = city;
  if (status) where.status = status;
  else where.status = 'ACTIVE';

  const [hosts, total] = await Promise.all([
    db.host.findMany({
      where,
      include: { _count: { select: { members: true, events: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.host.count({ where }),
  ]);

  return { hosts, total, page, totalPages: Math.ceil(total / limit) };
};

export const getHostById = async (id: string) => {
  return db.host.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, events: true } },
      events: { where: { isActive: true }, orderBy: { date: 'asc' }, take: 10 },
    },
  });
};

export const updateHost = async (id: string, data: Partial<{
  name: string;
  mobile: string;
  email: string;
  region: string;
  district: string;
  city: string;
  community: string;
  profilePhoto: string;
  status: HostStatus;
}>) => {
  return db.host.update({ where: { id }, data });
};

export const deleteHost = async (id: string) => {
  return db.host.delete({ where: { id } });
};

// ─── MEMBER MANAGEMENT ──────────────────────────────────────────────────────

export const assignMember = async (hostId: string, userId: string) => {
  return db.hostMember.create({ data: { hostId, userId } });
};

export const removeMember = async (hostId: string, userId: string) => {
  return db.hostMember.delete({
    where: { hostId_userId: { hostId, userId } },
  });
};

export const transferMember = async (fromHostId: string, toHostId: string, userId: string) => {
  return prisma.$transaction([
    db.hostMember.delete({ where: { hostId_userId: { hostId: fromHostId, userId } } }),
    db.hostMember.create({ data: { hostId: toHostId, userId } }),
  ]);
};

export const getHostMembers = async (hostId: string, filters: {
  gender?: string;
  page?: number;
  limit?: number;
}) => {
  const { gender, page = 1, limit = 20 } = filters;
  const where: any = { hostId };
  if (gender) where.user = { gender };

  const members = await db.hostMember.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { joinedAt: 'desc' },
  });

  const total = await db.hostMember.count({ where });

  return { members, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── HOST EVENTS ────────────────────────────────────────────────────────────

export const createHostEvent = async (data: {
  hostId: string;
  title: string;
  description?: string;
  date: Date;
  venue: string;
  fee?: number;
  maxParticipants?: number;
}) => {
  return db.hostEvent.create({ data: { ...data, fee: data.fee ?? undefined } });
};

export const getHostEvents = async (hostId: string) => {
  return db.hostEvent.findMany({
    where: { hostId, isActive: true },
    orderBy: { date: 'asc' },
  });
};

export const updateHostEvent = async (eventId: string, data: Partial<{
  title: string;
  description: string;
  date: Date;
  venue: string;
  fee: number;
  maxParticipants: number;
  isActive: boolean;
}>) => {
  return db.hostEvent.update({ where: { id: eventId }, data });
};

export const deleteHostEvent = async (eventId: string) => {
  return db.hostEvent.delete({ where: { id: eventId } });
};

// ─── HOST INTERESTS ─────────────────────────────────────────────────────────

export const createInterest = async (data: {
  hostId: string;
  fromUserId: string;
  toUserId: string;
  note?: string;
}) => {
  return db.hostInterest.create({ data });
};

export const getHostInterests = async (hostId: string, status?: string) => {
  const where: any = { hostId };
  if (status) where.status = status;
  return db.hostInterest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const updateInterestStatus = async (interestId: string, status: string) => {
  return db.hostInterest.update({
    where: { id: interestId },
    data: { status },
  });
};

// ─── HOST DASHBOARD STATS ───────────────────────────────────────────────────

export const getHostStats = async (hostId: string) => {
  const [totalMembers, pendingInterests, upcomingEvents] = await Promise.all([
    db.hostMember.count({ where: { hostId } }),
    db.hostInterest.count({ where: { hostId, status: 'pending' } }),
    db.hostEvent.count({ where: { hostId, isActive: true, date: { gte: new Date() } } }),
  ]);

  return { totalMembers, pendingInterests, upcomingEvents };
};
