export interface Booking {
  id: string;
  activity: string;
  subactivity: string;
  name: string;
  timeslot: string;
  arrived?: boolean;
  qr_code?: string;
}

export interface Config {
  system_time: string;
  activities: Record<string, { offset: number }>;
}

export interface RouteInfo {
  current: {
    plane: string;
    airport: string;
  };
  next: {
    plane: string;
    airport: string;
  };
}
