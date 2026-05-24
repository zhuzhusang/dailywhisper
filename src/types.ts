export interface Quote {
  id: string;
  content: string;
  author: string;
  source?: string;
  category?: string;
  enabled: boolean;
  createdAt: number;
}

export interface TornPaper {
  id: string;
  quoteId: string;
  content: string;
  author: string;
  source?: string;
  printedAt: number;
  dateStr: string;
  index: number;
}
