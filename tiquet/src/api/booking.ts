import { fetchJson } from "./client";
import { Endpoints } from "./endpoints";

export async function fetchBookings<T>(): Promise<T> {
    const data = fetchJson(Endpoints.bookings)
    return data as T;
}

export async function handleAction(action: string, id: string) {
    fetchJson(Endpoints.bookingAction(action, id),{method: 'POST'})
}