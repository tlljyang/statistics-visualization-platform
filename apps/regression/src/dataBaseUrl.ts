export function getRegressionDataBaseUrl(
  pathname: string,
  viteBaseUrl: string,
  isDev: boolean
): string {
  if (isDev && pathname.startsWith('/apps/regression/')) {
    return '/apps/regression/public/';
  }

  return viteBaseUrl;
}
