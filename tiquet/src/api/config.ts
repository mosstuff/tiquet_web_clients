import { fetchJson } from "./client";
import { Endpoints } from "./endpoints";
export async function fetchConfig<T>(): Promise<T> {
    const data = await fetchJson(Endpoints.config);
    return data as T;
}

export async function fetchTimeframesForActivity<T>(activity: string): Promise<T> {
    const data = await fetchJson(Endpoints.timeframe(activity))
    return data as T;
}