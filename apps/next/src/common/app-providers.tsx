import type { Session } from "next-auth";
import type { AppProps as NextAppProps } from "next/app";
import dynamic from "next/dynamic";

import { env } from "@quenti/env/client";
import { theme } from "@quenti/lib/chakra-theme";

import { ChakraProvider } from "@chakra-ui/provider";

const HighlightInit = dynamic(
  () => import("@highlight-run/next/client").then((mod) => mod.HighlightInit),
  { ssr: false },
);
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false },
);
const SessionListener = dynamic(
  () => import("./session-listener").then((mod) => mod.SessionListener),
  { ssr: false },
);
const IdentifyUser = dynamic(
  () => import("../lib/telemetry").then((mod) => mod.IdentifyUser),
  {
    ssr: false,
  },
);

// We can't use no-ssr boundary splitting for providers with children otherwise SEO and rendering will be broken
// Unfortunately, our bundle size is a bit larger but ttfb is still decent
const HistoryProvider = dynamic(() =>
  import("../modules/history-provider").then((mod) => mod.HistoryProvider),
);
const TelemetryProvider = dynamic(() =>
  import("../lib/telemetry").then((mod) => mod.TelemetryProvider),
);
const SessionProvider = dynamic(() =>
  import("next-auth/react").then((mod) => mod.SessionProvider),
);

export type AppProps = Omit<
  NextAppProps<{ session: Session } & Record<string, unknown>>,
  "Component"
> & {
  Component: NextAppProps["Component"] & {
    getLayout?: (
      page: React.ReactElement,
      router: NextAppProps["router"],
    ) => React.ReactNode;
    PageWrapper?: (props: AppProps) => JSX.Element;
  };
};

type AppPropsWithChildren = AppProps & { children: React.ReactNode };

export const AppProviders = (props: AppPropsWithChildren) => {
  return (
    <ChakraProvider theme={theme}>
      <TelemetryProvider>
        <HighlightInit
          manualStart
          excludedHostnames={["localhost"]}
          projectId={env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
          tracingOrigins
          networkRecording={{
            enabled: true,
            recordHeadersAndBody: true,
          }}
          environment={env.NEXT_PUBLIC_DEPLOYMENT}
        />
        <SessionProvider session={props.pageProps.session ?? undefined}>
          <SessionListener />
          <IdentifyUser />
          <HistoryProvider>{props.children}</HistoryProvider>
        </SessionProvider>
      </TelemetryProvider>
      <Analytics
        mode={
          env.NEXT_PUBLIC_DEPLOYMENT == "production"
            ? "production"
            : "development"
        }
      />
    </ChakraProvider>
  );
};
