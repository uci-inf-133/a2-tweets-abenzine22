
export type TweetSource = 'completed_event' | 'live_event' | 'achievement' | 'miscellaneous';

export default class Tweet {
  private _text: string;
  private _time: Date;

  constructor(text: string, created_at: string) {
    this._text = text;
    this._time = new Date(created_at);
  }

  get text(): string {
    return this._text;
  }

  get time(): Date {
    return this._time;
  }

  private cleanTextForWritten(): string {
    let t = this._text;

  
    t = t.replace(/https?:\/\/\S+/g, '').trim();

   
    t = t.replace(/#\w+/g, '').trim();

    
    const boilerplates = [
      'Just completed a',
      'Just posted a',
      'with @Runkeeper.',
      'with @Runkeeper',
      'Check it out!',
      'Watch my run right now with @Runkeeper Live',
      'Watch my run right now with @Runkeeper',
      'TomTom MySports Watch',
      'MySports Watch',
      'MySports Freestyle',
      'Achieved a new personal record with',
      'Achieved a new personal record',
      'Distance...',
      'New PB on this route',
    ];

    for (const bp of boilerplates) {
      const re = new RegExp(bp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      t = t.replace(re, ' ').trim();
    }

    
    t = t.replace(/\s+-\s+/g, ' ').replace(/\s{2,}/g, ' ').trim();

    return t;
  }

  get source(): TweetSource {
    const lower = this._text.toLowerCase();

    if (lower.startsWith('achieved a new personal record') || lower.includes('fitnessalerts') || lower.includes('goal')) {
      return 'achievement';
    }
    if (lower.includes('#rklive') || lower.includes('watch my run right now') || lower.includes(' live ')) {
      return 'live_event';
    }
    if (lower.startsWith('just completed') || lower.startsWith('just posted')) {
      return 'completed_event';
    }
    return 'miscellaneous';
  }

  get written(): boolean {
    if (this.source !== 'completed_event') {
      
      const cleaned = this.cleanTextForWritten();
      return cleaned.length > 0;
    }
    const cleaned = this.cleanTextForWritten();
    
    return cleaned.length > 0;
  }

  get writtenText(): string {
    const t = this.cleanTextForWritten();
    return t;
  }

  get activityType(): string | null {
    if (this.source !== 'completed_event') return null;

    const lower = this._text.toLowerCase();

    
    const keywords = [
      'run',
      'walk',
      'bike',
      'swim',
      'row',
      'elliptical',
      'spinning',
      'yoga',
      'meditation',
      'freestyle',
      'hike',
      'ski',
      'kayak',
      'activity',
    ];

    
    const distThenWord = this._text.match(/(?:\d+(?:\.\d+)?)\s*(?:km|mi)\s+([a-zA-Z]+)/i);
    if (distThenWord) {
      const candidate = distThenWord[1].toLowerCase();
      if (keywords.includes(candidate)) return candidate;
    }

    for (const k of keywords) {
      if (lower.includes(` ${k} `) || lower.endsWith(` ${k}`) || lower.startsWith(`${k} `)) {
        return k;
      }
    }
    
    if (lower.includes('mysports freestyle')) return 'freestyle';
    return 'activity';
  }

  get distance(): number | null {
    if (this.source !== 'completed_event') return null;

    
    const m = this._text.match(/(\d+(?:\.\d+)?)\s*(km|mi)\b/i);
    if (!m) return null;

    const val = parseFloat(m[1]);
    const unit = m[2].toLowerCase();

    if (isNaN(val)) return null;

    if (unit === 'mi') return val;
   
    return val * 0.621371;
  }

  get dayOfWeek(): number {
    
    return this._time.getDay();
  }

  getHTMLTableRow(index: number): string {
    
    const tweetHtml = this._text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    const type = this.activityType ?? '';
    return `<tr><th scope="row">${index}</th><td>${type}</td><td>${tweetHtml}</td></tr>`;
  }
}
