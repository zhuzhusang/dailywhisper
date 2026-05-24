export interface Quote {
  id: string;
  content: string;
  author?: string; // Make author optional
  source?: string;
  enabled: boolean;
  createdAt: number;
}

export interface TornPaper {
  id: string;
  quoteId: string;
  content: string;
  author?: string; // Make author optional
  source?: string;
  printedAt: number;
  dateStr: string;
  index: number;
}
