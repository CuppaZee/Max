import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React, { useEffect, useReducer } from "react";
import { useIsFetching, useQueryClient } from "react-query";
import day from "dayjs";
import { ActivityIndicator, Platform } from "react-native";
import Icon from "../components/Common/Icon";
import { Box, Button, Heading, HStack, Text, useTheme } from "native-base";

export function LoadIcon() {
  const loading = useIsFetching();
  const queryClient = useQueryClient();
  const theme = useTheme();
  return (
    <Button
      size="sm"
      variant="ghost"
      startIcon={
        loading ? (
          <ActivityIndicator color={theme.colors.regularGray[500]} size={24} />
        ) : (
          <Icon style={{ height: 24 }} name="refresh" />
        )
      }
      onPress={() =>
        queryClient.refetchQueries({
          predicate: query => query.queryKey[0] !== "token",
          active: true,
        })
      }
    />
  );
}

export function HeaderTitle(props: { title: string }) {
  return (
    <Box>
      <Heading
        textAlign={Platform.OS === "ios" ? "center" : "left"}
        numberOfLines={1}
        fontSize="lg">
        {props.title}
      </Heading>
      <Text textAlign={Platform.OS === "ios" ? "center" : "left"} numberOfLines={1} fontSize="sm">
        <Time />
      </Text>
    </Box>
  );
}

function Time() {
  const [_, u] = useReducer(i => i + 1, 0);
  useEffect(() => {
    const interval = setInterval(() => {
      u();
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return <>{day.mhqNow().format("L LT [MHQ]")}</>;
}

export default function Header(props: NativeStackHeaderProps) {
  const title = props.options.headerTitle?.toString() ?? props.route.name;
  return (
    <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} safeAreaTop>
      <HStack alignItems="center" p={1}>
        {!!props.back && (
          <Button
            size="sm"
            variant="ghost"
            style={{ opacity: props.navigation.canGoBack() ? 1 : 0.4 }}
            startIcon={<Icon style={{ height: 24 }} name="arrow-left" />}
            onPress={() => props.navigation.goBack()}
          />
        )}
        <Box pl={props.back ? 0 : 2} flex={1}>
          <HeaderTitle title={title} />
        </Box>
        <LoadIcon />
      </HStack>
    </Box>
  );
}
