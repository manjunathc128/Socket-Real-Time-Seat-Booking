import { Request, Response } from 'express';
import { UserSessionModel } from '../models/UserSession.model';

export const getActiveUsers = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const activeUsers = await UserSessionModel.getActiveUsersForEvent(parseInt(eventId));
        
        res.json({
            success: true,
            data: {
                count: activeUsers.length,
                users: activeUsers.map(user => ({
                    userId: user.user_id,
                    lastActivity: user.last_activity
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get active users'
        });
    }
};