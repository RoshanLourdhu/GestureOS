/**
 * 1D Kalman Filter for smooth cursor tracking.
 * Maintains state of position (and optional velocity) to filter out hand tremor/noise.
 */
export class KalmanFilter {
  private x: number = 0; // State estimate (position)
  private p: number = 1; // Estimate covariance
  private q: number = 0.01; // Process noise covariance (smaller = smoother, more lag)
  private r: number = 0.5; // Measurement noise covariance (larger = smoother, more lag)
  private initialized: boolean = false;

  constructor(processNoise: number = 0.005, measurementNoise: number = 0.1) {
    this.q = processNoise;
    this.r = measurementNoise;
  }

  public setNoiseParameters(processNoise: number, measurementNoise: number) {
    this.q = processNoise;
    this.r = measurementNoise;
  }

  public filter(measurement: number): number {
    if (!this.initialized) {
      this.x = measurement;
      this.p = 1;
      this.initialized = true;
      return this.x;
    }

    // Prediction Phase
    const xPred = this.x;
    const pPred = this.p + this.q;

    // Update Phase
    const k = pPred / (pPred + this.r); // Kalman gain
    this.x = xPred + k * (measurement - xPred);
    this.p = (1 - k) * pPred;

    return this.x;
  }

  public reset(): void {
    this.initialized = false;
  }
}

/**
 * Exponential Moving Average (EMA) filter.
 * Quick, reactive, and needs very little state.
 */
export class ExponentialFilter {
  private value: number = 0;
  private alpha: number = 0.2; // Smoothing factor (0 < alpha <= 1). Lower is smoother, higher is more responsive.
  private initialized: boolean = false;

  constructor(alpha: number = 0.2) {
    this.alpha = Math.max(0.01, Math.min(1, alpha));
  }

  public setAlpha(alpha: number) {
    this.alpha = Math.max(0.01, Math.min(1, alpha));
  }

  public filter(measurement: number): number {
    if (!this.initialized) {
      this.value = measurement;
      this.initialized = true;
      return this.value;
    }
    this.value = this.alpha * measurement + (1 - this.alpha) * this.value;
    return this.value;
  }

  public reset(): void {
    this.initialized = false;
  }
}

/**
 * Double Exponential (Holt's Linear) Filter.
 * Accounts for velocity/trend, which reduces lag when the hand is in motion.
 */
export class DoubleExponentialFilter {
  private level: number = 0;
  private trend: number = 0;
  private alpha: number = 0.25; // Level factor
  private beta: number = 0.15;  // Trend factor
  private initialized: boolean = false;

  constructor(alpha: number = 0.25, beta: number = 0.15) {
    this.alpha = alpha;
    this.beta = beta;
  }

  public setParameters(alpha: number, beta: number) {
    this.alpha = alpha;
    this.beta = beta;
  }

  public filter(measurement: number): number {
    if (!this.initialized) {
      this.level = measurement;
      this.trend = 0;
      this.initialized = true;
      return this.level;
    }

    const prevLevel = this.level;
    const prevTrend = this.trend;

    // Update level and trend
    this.level = this.alpha * measurement + (1 - this.alpha) * (prevLevel + prevTrend);
    this.trend = this.beta * (this.level - prevLevel) + (1 - this.beta) * prevTrend;

    return this.level;
  }

  public reset(): void {
    this.initialized = false;
  }
}

/**
 * Standard Moving Average (SMA) filter.
 * Computes average of the last N frames.
 */
export class MovingAverageFilter {
  private windowSize: number = 5;
  private values: number[] = [];

  constructor(windowSize: number = 5) {
    this.windowSize = Math.max(1, windowSize);
  }

  public setWindowSize(size: number) {
    this.windowSize = Math.max(1, size);
    // Trim values if window size shrunk
    while (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }

  public filter(measurement: number): number {
    this.values.push(measurement);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }

    const sum = this.values.reduce((a, b) => a + b, 0);
    return sum / this.values.length;
  }

  public reset(): void {
    this.values = [];
  }
}

/**
 * Cursor Coordinate Filter combines two of the selected filter types
 * (one for X axis, one for Y axis).
 */
export class CursorSmoother {
  private filterX: any;
  private filterY: any;
  private activeType: 'kalman' | 'exponential' | 'moving_average' = 'kalman';

  constructor(type: 'kalman' | 'exponential' | 'moving_average' = 'kalman') {
    this.setType(type);
  }

  public setType(type: 'kalman' | 'exponential' | 'moving_average', options?: any) {
    this.activeType = type;
    
    if (type === 'kalman') {
      const q = options?.processNoise ?? 0.005;
      const r = options?.measurementNoise ?? 0.15;
      this.filterX = new KalmanFilter(q, r);
      this.filterY = new KalmanFilter(q, r);
    } else if (type === 'exponential') {
      const alpha = options?.emaAlpha ?? 0.15;
      this.filterX = new DoubleExponentialFilter(alpha, alpha * 0.6);
      this.filterY = new DoubleExponentialFilter(alpha, alpha * 0.6);
    } else {
      const size = options?.windowSize ?? 6;
      this.filterX = new MovingAverageFilter(size);
      this.filterY = new MovingAverageFilter(size);
    }
  }

  public updateNoiseParameters(q: number, r: number) {
    if (this.activeType === 'kalman') {
      this.filterX.setNoiseParameters(q, r);
      this.filterY.setNoiseParameters(q, r);
    }
  }

  public updateEmaAlpha(alpha: number) {
    if (this.activeType === 'exponential') {
      this.filterX.setParameters(alpha, alpha * 0.6);
      this.filterY.setParameters(alpha, alpha * 0.6);
    }
  }

  public updateWindowSize(size: number) {
    if (this.activeType === 'moving_average') {
      this.filterX.setWindowSize(size);
      this.filterY.setWindowSize(size);
    }
  }

  public smooth(x: number, y: number): { x: number; y: number } {
    return {
      x: this.filterX.filter(x),
      y: this.filterY.filter(y)
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
