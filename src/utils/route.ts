/**
 * Route path of a pathname of this site, as the router sees it: without the
 * app base nor a trailing slash ('/base/about/' → '/about'; the root stays '/').
 */
export function pageRoute(pathname: string, base: string): string {
    const prefix = base.replace(/\/$/, '');
    const route = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
    if (route === '') return '/';
    return route.length > 1 ? route.replace(/\/$/, '') : route;
}
