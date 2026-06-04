import { Request, Response, NextFunction } from 'express';
import * as hostService from '@services/host.service';

// ─── HOST CRUD ──────────────────────────────────────────────────────────────

export const createHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = await hostService.createHost(req.body);
    res.status(201).json({ success: true, data: host });
  } catch (err) { next(err); }
};

export const getHosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { region, district, city, status, page, limit } = req.query;
    const data = await hostService.getHosts({
      region: region as string,
      district: district as string,
      city: city as string,
      status: status as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getHostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = await hostService.getHostById(req.params.id);
    if (!host) return res.status(404).json({ success: false, message: 'Host not found' });
    res.json({ success: true, data: host });
  } catch (err) { next(err); }
};

export const updateHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = await hostService.updateHost(req.params.id, req.body);
    res.json({ success: true, data: host });
  } catch (err) { next(err); }
};

export const deleteHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await hostService.deleteHost(req.params.id);
    res.json({ success: true, message: 'Host deleted' });
  } catch (err) { next(err); }
};

// ─── MEMBER MANAGEMENT ──────────────────────────────────────────────────────

export const assignMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const member = await hostService.assignMember(req.params.id, userId);
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await hostService.removeMember(req.params.id, req.params.userId);
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

export const transferMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toHostId, userId } = req.body;
    await hostService.transferMember(req.params.id, toHostId, userId);
    res.json({ success: true, message: 'Member transferred' });
  } catch (err) { next(err); }
};

export const getHostMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gender, page, limit } = req.query;
    const data = await hostService.getHostMembers(req.params.id, {
      gender: gender as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── HOST EVENTS ────────────────────────────────────────────────────────────

export const createHostEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await hostService.createHostEvent({ ...req.body, hostId: req.params.id });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};

export const getHostEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await hostService.getHostEvents(req.params.id);
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

export const updateHostEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await hostService.updateHostEvent(req.params.eventId, req.body);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

export const deleteHostEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await hostService.deleteHostEvent(req.params.eventId);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

// ─── HOST INTERESTS ─────────────────────────────────────────────────────────

export const createInterest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interest = await hostService.createInterest({ ...req.body, hostId: req.params.id });
    res.status(201).json({ success: true, data: interest });
  } catch (err) { next(err); }
};

export const getHostInterests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const interests = await hostService.getHostInterests(req.params.id, status as string);
    res.json({ success: true, data: interests });
  } catch (err) { next(err); }
};

export const updateInterestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const interest = await hostService.updateInterestStatus(req.params.interestId, status);
    res.json({ success: true, data: interest });
  } catch (err) { next(err); }
};

// ─── HOST DASHBOARD ─────────────────────────────────────────────────────────

export const getHostStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await hostService.getHostStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
