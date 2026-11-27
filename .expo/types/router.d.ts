/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../services/mobileAuthContext`; params?: Router.UnknownInputParams; } | { pathname: `/../components/crossplatform/MobileHeader`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(candidate)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(candidate)'}/live-room` | `/live-room`; params?: Router.UnknownInputParams; } | { pathname: `${'/(interviewer)'}` | `/`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/../services/mobileAuthContext`; params?: Router.UnknownOutputParams; } | { pathname: `/../components/crossplatform/MobileHeader`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(candidate)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(candidate)'}/live-room` | `/live-room`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(interviewer)'}` | `/`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/../services/mobileAuthContext${`?${string}` | `#${string}` | ''}` | `/../components/crossplatform/MobileHeader${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(candidate)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(candidate)'}/live-room${`?${string}` | `#${string}` | ''}` | `/live-room${`?${string}` | `#${string}` | ''}` | `${'/(interviewer)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString | Router.ExternalPathString | `/` | `/../services/mobileAuthContext` | `/../components/crossplatform/MobileHeader` | `/_sitemap` | `${'/(candidate)'}` | `/` | `${'/(candidate)'}/live-room` | `/live-room` | `${'/(interviewer)'}` | `/`; params?: Router.UnknownInputParams; };
    }
  }
}
