import { Injectable } from '@angular/core';

export interface TeamsClassEvent {
  id: string;
  titulo: string;
  docente?: string;
  inicio: Date;
  fin: Date;
  horaFormateada: string;
  joinTeamsUrl?: string;
  isLiveNow: boolean;
  isUpcomingToday: boolean;
}

export interface M365UserProfile {
  displayName: string;
  email: string;
  jobTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MicrosoftSenatiService {
  private readonly TOKEN_KEY = 'central_m365_token';
  private readonly PROFILE_KEY = 'central_m365_profile';
  private readonly CALENDAR_FEED_KEY = 'central_m365_feed_url';

  constructor() {}

  getProfile(): M365UserProfile | null {
    const raw = localStorage.getItem(this.PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isConnected(): boolean {
    return !!this.getProfile() || !!this.getCalendarFeedUrl();
  }

  getCalendarFeedUrl(): string {
    return localStorage.getItem(this.CALENDAR_FEED_KEY) || '';
  }

  saveCalendarFeedUrl(url: string): void {
    localStorage.setItem(this.CALENDAR_FEED_KEY, url.trim());
  }

  disconnect(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
    localStorage.removeItem(this.CALENDAR_FEED_KEY);
  }

  /**
   * Guarda manualmente un perfil o token de Microsoft 365
   */
  setManualProfile(displayName: string, email: string) {
    const profile: M365UserProfile = {
      displayName: displayName.trim() || 'Estudiante SENATI',
      email: email.trim() || 'alumno@senati.pe'
    };
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  /**
   * Obtiene las reuniones de Teams y clases del día desde el feed iCal de Outlook SENATI
   */
  async getTodayEventsFromFeed(feedUrl?: string): Promise<TeamsClassEvent[]> {
    const url = (feedUrl || this.getCalendarFeedUrl()).trim();
    if (!url) return [];

    let cleanUrl = url;
    if (cleanUrl.startsWith('webcal://')) {
      cleanUrl = 'https://' + cleanUrl.slice(9);
    }

    let icsContent = '';
    try {
      const resp = await fetch(cleanUrl);
      if (resp.ok) {
        icsContent = await resp.text();
      }
    } catch (e) {
      // Fallback a proxy CORS
      try {
        const proxyResp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`);
        if (proxyResp.ok) {
          icsContent = await proxyResp.text();
        }
      } catch (err) {
        console.warn('Error leyendo feed de Outlook SENATI:', err);
      }
    }

    if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
      return [];
    }

    return this.parseOutlookIcsToday(icsContent);
  }

  /**
   * Parser iCal optimizado para extraer enlaces de Teams de Outlook
   */
  private parseOutlookIcsToday(icsContent: string): TeamsClassEvent[] {
    const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
    const lines = unfolded.split(/\r?\n/);

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const nowTime = now.getTime();

    const events: TeamsClassEvent[] = [];
    let inEvent = false;
    let curr: any = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === 'BEGIN:VEVENT') {
        inEvent = true;
        curr = {};
        continue;
      }
      if (trimmed === 'END:VEVENT') {
        inEvent = false;
        if (curr.summary && curr.dtstart) {
          const startDate = new Date(curr.dtstart);
          const endDate = curr.dtend ? new Date(curr.dtend) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

          // Verificar si corresponde al día de hoy
          if (
            startDate.getFullYear() === todayYear &&
            startDate.getMonth() === todayMonth &&
            startDate.getDate() === todayDate
          ) {
            const isLiveNow = nowTime >= startDate.getTime() && nowTime <= endDate.getTime();
            const isUpcomingToday = nowTime < startDate.getTime();

            // Buscar link de Teams en la descripción o ubicación
            const joinUrl = this.extractTeamsUrl(curr.description || '') || this.extractTeamsUrl(curr.location || '') || curr.url;

            const formatHour = (d: Date) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            events.push({
              id: curr.uid || 'teams_' + Math.random().toString(36).substring(2, 9),
              titulo: curr.summary,
              docente: curr.organizer || '',
              inicio: startDate,
              fin: endDate,
              horaFormateada: `${formatHour(startDate)} - ${formatHour(endDate)}`,
              joinTeamsUrl: joinUrl,
              isLiveNow,
              isUpcomingToday
            });
          }
        }
        continue;
      }

      if (!inEvent) continue;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const keyPart = trimmed.substring(0, colonIdx);
      const val = trimmed.substring(colonIdx + 1);
      const prop = keyPart.split(';')[0].toUpperCase();

      switch (prop) {
        case 'UID': curr.uid = val; break;
        case 'SUMMARY': curr.summary = val; break;
        case 'DESCRIPTION': curr.description = val; break;
        case 'LOCATION': curr.location = val; break;
        case 'DTSTART': curr.dtstart = this.parseDate(val); break;
        case 'DTEND': curr.dtend = this.parseDate(val); break;
        case 'ORGANIZER': curr.organizer = val.replace(/CN=/i, '').replace(/mailto:/i, ''); break;
        case 'URL': curr.url = val; break;
      }
    }

    return events.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  private extractTeamsUrl(text: string): string | undefined {
    const match = text.match(/https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s"<>]+/i);
    return match ? match[0] : undefined;
  }

  private parseDate(val: string): string {
    const clean = val.trim();
    if (clean.length >= 8) {
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      let h = '00', min = '00', s = '00';
      if (clean.includes('T')) {
        const time = clean.split('T')[1].replace('Z', '');
        if (time.length >= 4) {
          h = time.substring(0, 2);
          min = time.substring(2, 4);
          if (time.length >= 6) s = time.substring(4, 6);
        }
      }
      if (clean.endsWith('Z')) {
        return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s))).toISOString();
      }
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)).toISOString();
    }
    return new Date().toISOString();
  }
}
