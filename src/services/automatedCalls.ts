import { supabase } from '../lib/supabase';
import { integrationService } from '../lib/database';
import { isWithinCallHours, getNextCallWindow } from '../utils/timezone';

type SchedulerCallback = () => void;

class AutomatedCallService {
  private isRunning: boolean = false;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private onScheduleUpdateCallbacks: SchedulerCallback[] = [];
  private readonly voices = ['nat', 'josh', 'rachel', 'emily'];
  private usedVoices: Record<string, string> = {};
  private blandSettings: any = null;

  constructor() {
    // Remove auto-initialization to prevent errors on load
  }

  private async ensureInitialized() {
    if (!this.blandSettings) {
      try {
        this.blandSettings = await integrationService.getBlandSettings();
      } catch (error) {
        console.error('Failed to initialize Bland settings:', error);
        return false;
      }
    }
    return true;
  }

  public isAutomationRunning(): boolean {
    return this.isRunning;
  }

  public onScheduleUpdate(callback: SchedulerCallback): () => void {
    this.onScheduleUpdateCallbacks.push(callback);
    return () => {
      this.onScheduleUpdateCallbacks = this.onScheduleUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyScheduleUpdate() {
    this.onScheduleUpdateCallbacks.forEach(callback => callback());
  }

  private getNextVoice(accountId: string): string {
    const lastVoice = this.usedVoices[accountId];
    const availableVoices = this.voices.filter(v => v !== lastVoice);
    const nextVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)] || 'nat';
    this.usedVoices[accountId] = nextVoice;
    return nextVoice;
  }

  private async makeCall(phoneNumber: string, accountId: string, voice: string): Promise<boolean> {
    try {
      // Ensure settings are initialized
      if (!await this.ensureInitialized()) {
        return false;
      }

      if (!this.blandSettings?.apiKey) {
        console.error('Bland AI API key not configured');
        return false;
      }

      if (!this.blandSettings.pathwayId) {
        console.error('Bland AI pathway ID not configured');
        return false;
      }

      // Validate voice
      if (!this.voices.includes(voice)) {
        voice = 'nat'; // Default to 'nat' if invalid voice
      }

      // First create the call log entry
      const { data: logData, error: logError } = await supabase
        .from('call_logs')
        .insert({
          account_id: accountId,
          phone_number: phoneNumber,
          status: 'initiated',
          call_time: new Date().toISOString(),
          voice_used: voice,
          from_number: this.blandSettings.fromNumber
        })
        .select()
        .single();

      if (logError) throw logError;

      // Format phone number for API
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      // Make the API call to Bland AI
      const response = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'Authorization': this.blandSettings.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          from: this.blandSettings.fromNumber,
          voice: voice,
          model: this.blandSettings.model || 'enhanced',
          max_duration: parseInt(this.blandSettings.maxDuration || '300'),
          record: this.blandSettings.record === 'true',
          wait_for_greeting: true,
          amd: true,
          pathway_id: this.blandSettings.pathwayId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to initiate call');
      }

      // Update call log with success
      await supabase
        .from('call_logs')
        .update({
          status: 'completed',
          bland_call_id: data.call_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', logData.id);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async processWorkableAccounts() {
    if (!this.isRunning) {
      return;
    }

    try {
      // Ensure settings are initialized before processing
      if (!await this.ensureInitialized()) {
        return;
      }

      // Get all accounts with phone numbers
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select(`
          id,
          account_number,
          debtor_name,
          phone_numbers (
            id,
            number
          )
        `);

      if (error) throw error;

      if (!accounts || accounts.length === 0) {
        return;
      }

      // Process each account
      for (const account of accounts) {
        if (!this.isRunning) break;

        if (account.phone_numbers && account.phone_numbers.length > 0) {
          for (const phone of account.phone_numbers) {
            if (!phone.number) continue;

            await this.makeCall(phone.number, account.id, this.getNextVoice(account.id));
          }
        }
      }

      this.notifyScheduleUpdate();
    } catch (error) {
      // Silently handle errors to prevent console spam
    }
  }

  public async start() {
    if (this.isRunning) return;
    
    // Ensure settings are initialized before starting
    if (!await this.ensureInitialized()) {
      return;
    }
    
    this.isRunning = true;
    
    // Initial processing
    this.processWorkableAccounts();

    // Set up interval for continuous processing
    this.schedulerInterval = setInterval(() => {
      this.processWorkableAccounts();
    }, 60000); // Check every minute
  }

  public stop() {
    this.isRunning = false;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.notifyScheduleUpdate();
  }
}

export const automatedCallService = new AutomatedCallService();