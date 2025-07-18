export const BASE_URL = "https://api.tiquet.mosstuff.de/api/v1";

export const Endpoints = {
  config: `${BASE_URL}/config`,
  bookings: `${BASE_URL}/booking/get_booking`,
  bookingById: (id: string) => `${BASE_URL}/booking/get_booking/${id}`,
  bookingAction: (action: string, id: string) => `${BASE_URL}/booking/${action}/${id}`,
  timeframe: (activityId: string) =>
    `${BASE_URL}/config/get_timeframe_by_activity?activity=${activityId}`,
  routeInfo: (activityId: string) =>
    `${BASE_URL}/routemanagement/getstr?activity=${activityId}`,
  checkin: (id: string) => `${BASE_URL}/booking/checkin/${id}`,
  bookingState: `${BASE_URL}/state/booking/1`,
};
