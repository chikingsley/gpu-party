export interface AudioOptions {
  fftSize: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export interface AudioAnalysis {
  frequencies: number[];
  timestamp: number;
}

export interface FrequencyBand {
  start: number;
  end: number;
  average: number;
}
