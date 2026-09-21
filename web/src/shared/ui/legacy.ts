type CallableMap = Record<string, (...args: unknown[]) => unknown>;

function callMap(source: unknown, method: string, args: unknown[]): void {
  const table = source as CallableMap | undefined;
  table?.[method]?.(...args);
}

export function callApp(method: string, ...args: unknown[]): void {
  callMap(window.App, method, args);
}

export function callInteractions(method: string, ...args: unknown[]): void {
  callMap((window as unknown as { AppInteractions?: CallableMap }).AppInteractions, method, args);
}

export function callCharts(method: string, ...args: unknown[]): void {
  callMap(window.AppCharts, method, args);
}
