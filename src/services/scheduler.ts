import { automatedCallService } from './automatedCalls';

type SchedulerCallback = () => void;

class CallScheduler {
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private onScheduleUpdateCallbacks: SchedulerCallback[] = [];
  private delayRange: number = 30; // Default 30 second max delay

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start the automated call service
    automatedCallService.start();

    // Initial scheduling
    this.processSchedule();

    // Check and schedule calls every minute
    this.schedulerInterval = setInterval(() => {
      this.processSchedule();
    }, 60000); // Check every minute

    // Notify listeners that schedule has been updated
    this.notifyScheduleUpdate();
  }

  stop() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    automatedCallService.stop();
    // Notify listeners that schedule has been cleared
    this.notifyScheduleUpdate();
  }

  isActive() {
    return this.isRunning;
  }

  setDelayRange(seconds: number) {
    this.delayRange = Math.max(1, Math.min(300, seconds)); // Limit between 1-300 seconds
  }

  getDelayRange(): number {
    return this.delayRange;
  }

  getRandomDelay(): number {
    return Math.floor(Math.random() * this.delayRange * 1000); // Convert to milliseconds
  }

  onScheduleUpdate(callback: SchedulerCallback) {
    this.onScheduleUpdateCallbacks.push(callback);
    return () => {
      this.onScheduleUpdateCallbacks = this.onScheduleUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyScheduleUpdate() {
    this.onScheduleUpdateCallbacks.forEach(callback => callback());
  }

  private async processSchedule() {
    if (!this.isRunning) return;

    try {
      // Process workable accounts
      await automatedCallService.processWorkableAccounts();
      
      // Notify listeners that schedule has been updated
      this.notifyScheduleUpdate();

    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }
}

export const callScheduler = new CallScheduler();