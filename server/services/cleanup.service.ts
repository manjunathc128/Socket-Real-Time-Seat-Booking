import { UserSessionModel } from '../models/UserSession.model'

export class CleanupService {
    private static interval: NodeJS.Timeout | null = null;

    static start() {
        this.interval = setInterval(async () => {
            try{
                await UserSessionModel.cleanupInactiveSessions()
                console.log('🧹 Cleaned up inactive user sessions');
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }, 5 * 60 * 1000)
          console.log('🚀 Cleanup service started');
    }

    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            console.log('🛑 Cleanup service stopped');
        }
    }
    
}