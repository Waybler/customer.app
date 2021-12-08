import { API_RESULT } from './api';

export interface HistoryForDay {
  date: string; // Date string
  energy: number;
  sessions: number;
}

export interface HistoryForMonthAPIResponse {
  perDay: HistoryForDay[];
  result: API_RESULT;
  totals: {
    energy: number;
    sessions: number;
  };
}

export interface HistoryChartDatum {
  name: string; // Date string
  value: number;
}

export interface HistoryForMonthGUIModel extends HistoryForMonthAPIResponse {
  chartData: HistoryChartDatum[];
}
