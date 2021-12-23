import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  /**
   * Creates event source
   * @param url
   */
  getEventSource(url: string): EventSource {
    return new EventSource(url);
  }
}
