import * as React from "react";
import loadable, { DefaultComponent, OptionsWithResolver } from "@loadable/component";
import { ActivityIndicator, Platform } from "react-native";
import { Box } from "native-base";

export default function lazy(
  loadFn: (props: unknown) => Promise<DefaultComponent<unknown>>,
  options?: OptionsWithResolver<unknown, DefaultComponent<unknown>>
) {
  return loadable(
    async a => {
      try {
        return await loadFn(a);
      } catch (e) {
        if (Platform.OS === "web") {
          location.reload();
        }
        return () => (
          <Box
            bg="regularGray.100"
            _dark={{ bg: "regularGray.900" }}
            flex={1}
            justifyContent="center"
            alignItems="center">
            <ActivityIndicator size={24} />
          </Box>
        );
      }
    },
    {
      fallback: (
        <Box
          bg="regularGray.100"
          _dark={{ bg: "regularGray.900" }}
          flex={1}
          justifyContent="center"
          alignItems="center">
          <ActivityIndicator size={24} />
        </Box>
      ),
      ...(options ?? {}),
    }
  );
}
