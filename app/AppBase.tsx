import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as zipson from "zipson";

import "./polyfill";

import { useColorScheme } from "react-native";
import Navigation from "./navigation";
import { QueryClient, QueryClientProvider } from "react-query";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { Provider as JotaiProvider } from "jotai";

import "./lang/i18n";

import CheckStatus from "./BackgroundLocation";
import useSetting, {
  LiveLocationErrorAtom, store,
} from "./hooks/useSetting";
import { useTranslation } from "react-i18next";
import "expo-firebase-analytics";
import * as Sentry from "sentry-expo";
import EvaWrapper from "./EvaWrapper";
import { extendTheme, NativeBaseProvider, useColorMode } from "native-base";

Sentry.init({
  dsn: "https://7823a6409bf1417dafa6f3e3ab47b6ed@o444031.ingest.sentry.io/5418530",
} as any);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 900000,
      retry: 1,
    },
  },
});


persistQueryClient({
  queryClient,
  persistor: {
    persistClient(client) {
      try {
        client.clientState.queries.forEach(query => {
          query.state.isFetching = false;
        });
        return store.set("@cz3/querycache", zipson.stringify(client));
      } catch {
        return store.set("@cz3/querycache", zipson.stringify(client));
      }
    },
    restoreClient() {
      return zipson.parse(store.getString("@cz3/querycache") ?? "null");
    },
    removeClient() {
      return store.delete("@cz3/querycache");
    },
  },
});

function ColorModeHandler() {
  const colorScheme = useColorScheme();
  const colorMode = useColorMode();
  useEffect(() => {
    colorMode.setColorMode(colorScheme);
  }, [colorScheme]);
  return null;
}

function AppBase() {
  const colorScheme = useColorScheme();
  const [liveLocationError, setLiveLocationError] = useSetting(
    LiveLocationErrorAtom
  );

  React.useEffect(() => {
    if (!liveLocationError) {
      CheckStatus().then(value => setLiveLocationError(value));
    }
  }, [liveLocationError]);
  const { i18n } = useTranslation();
  const theme = useMemo(() => {
    const defaultTheme = extendTheme({});
    return extendTheme({
      config: {
        initialColorMode: colorScheme,
      },
      colors: {
        regularGray: defaultTheme.colors.blueGray,
        primary: defaultTheme.colors.teal,
      },
    });
  }, [colorScheme]);

  return (
    <>
      <NativeBaseProvider theme={theme}>
        <ColorModeHandler />
        <EvaWrapper>
          <Navigation key={i18n.language} colorScheme={colorScheme} />
          <StatusBar />
        </EvaWrapper>
      </NativeBaseProvider>
    </>
  );
}

export default function AppProviders() {
  return (
    <SafeAreaProvider>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <AppBase />
        </QueryClientProvider>
      </JotaiProvider>
    </SafeAreaProvider>
  );
}
