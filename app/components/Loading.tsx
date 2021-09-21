import {
  useRoute,
} from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Platform, View } from "react-native";
import { QueryObserverResult } from "react-query";
import useComponentSize from "../hooks/useComponentSize";
import useLogin from "../hooks/useLogin";
import { useAccounts } from "../hooks/useToken";
import Icon from "./Common/Icon";
import baseURL from "../baseURL";
import { Box, Button, Heading, Text, useColorMode, useTheme } from "native-base";

function LoginError({ children }: { children: (login: () => void) => React.ReactElement }) {
  const [, login] = useLogin(Platform.OS === "web" ? window.location.pathname.replace(/^\//, "") : "");
  return children(login);
}

export default function Loading({
  data,
  customErrors,
  bg,
  darkBg,
  skeleton: Skeleton,
}: {
  data?: (QueryObserverResult & {
    tokenStatus?: {
      status: string;
      user_id: string | number | undefined;
      token?: any;
    };
  })[];
  customErrors?: any[];
  bg?: string | false;
  darkBg?: string | false;
  skeleton?: (props: {
    backgroundColor?: string;
    colors?: string[];
    backgroundSize?: number;
    colorMode?: "light" | "dark";
  }) => React.ReactElement;
}) {
  const { t } = useTranslation();
  const [size, onLayout] = useComponentSize();
  const route = useRoute();
  const accounts = useAccounts();
  const [sentReport, setSentReport] = React.useState(false);
  const { colorMode } = useColorMode();
  const theme = useTheme();
  if (data?.some(i => i.tokenStatus?.status === "missing")) {
    return (
      <Box
        bg={bg === false ? undefined : bg ?? "regularGray.100"}
        _dark={{ bg: darkBg === false ? undefined : darkBg ?? "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={
            colorMode === "dark"
              ? require("../assets/images/error.png")
              : require("../assets/images/error-light.png")
          }
          resizeMode="contain"
          style={{
            width: Math.min(300, size?.width || 0),
            height: Math.min(100, size?.height || 0),
          }}
        />
        <Heading fontSize="xl">
          {t("error:user_device_title", {
            username: (route.params as any)?.username || "this user",
          })}
        </Heading>
        <Heading fontSize="md">{t("error:user_device_description")}</Heading>
        <LoginError>
          {login => (
            <Button
              onPress={login}
              style={{ margin: 4 }}
              color="success.500"
              startIcon={<Icon colorBlank name="account-plus" style={{ height: 24 }} />}>
              {t("error:user_device_add_account")}
            </Button>
          )}
        </LoginError>
      </Box>
    );
  }

  if (data?.some(i => i.tokenStatus?.status === "failed")) {
    return (
      <Box
        bg={bg === false ? undefined : bg ?? "regularGray.100"}
        _dark={{ bg: darkBg === false ? undefined : darkBg ?? "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={
            colorMode === "dark"
              ? require("../assets/images/error.png")
              : require("../assets/images/error-light.png")
          }
          resizeMode="contain"
          style={{
            width: Math.min(300, size?.width || 0),
            height: Math.min(100, size?.height || 0),
          }}
        />
        <Heading style={{ textAlign: "center" }} fontSize="xl">
          Unable to connect to CuppaZee's server.
        </Heading>
        <Heading style={{ textAlign: "center" }} fontSize="md">
          Check your internet connection and try again. If you've got a stable internet connection,
          then CuppaZee's server might be down.
        </Heading>
      </Box>
    );
  }
  if (
    data?.some(i => i.tokenStatus?.status === "expired") ||
    data?.some(i => {
      if (i.error && typeof i.error === "object") {
        if ("status" in i.error) {
          if ((i.error as any).status === 401 || (i.error as any).status === "401") {
            return true;
          }
        }
      }
      return false;
    })
  ) {
    return (
      <Box
        bg={bg === false ? undefined : bg ?? "regularGray.100"}
        _dark={{ bg: darkBg === false ? undefined : darkBg ?? "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={
            colorMode === "dark"
              ? require("../assets/images/error.png")
              : require("../assets/images/error-light.png")
          }
          resizeMode="contain"
          style={{
            width: Math.min(300, size?.width || 0),
            height: Math.min(100, size?.height || 0),
          }}
        />
        <Heading fontSize="xl">
          {t("error:user_expired_title", {
            username:
              accounts.find(acct => 
                acct.user_id.toString() === data.find(i => i.tokenStatus?.status === "expired")?.tokenStatus?.user_id?.toString() || ""
              )?.username || "you",
          })}
        </Heading>
        <Heading fontSize="md">{t("error:user_expired_description")}</Heading>
        <LoginError>
          {login => (
            <Button
              onPress={login}
              style={{ margin: 4 }}
              color="success.500"
              startIcon={<Icon colorBlank name="account-plus" style={{ height: 24 }} />}>
              {t("error:user_expired_log_in")}
            </Button>
          )}
        </LoginError>
      </Box>
    );
  }
  if (customErrors?.length || data?.some(i => i.isError)) {
    return (
      <Box
        bg={bg === false ? undefined : bg ?? "regularGray.100"}
        _dark={{ bg: darkBg === false ? undefined : darkBg ?? "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={
            colorMode === "dark"
              ? require("../assets/images/error.png")
              : require("../assets/images/error-light.png")
          }
          resizeMode="contain"
          style={{
            width: Math.min(300, size?.width || 0),
            height: Math.min(100, size?.height || 0),
          }}
        />
        <Heading fontSize="xl">{t("error:error_title")}</Heading>
        <Heading fontSize="md">{t("error:error_description")}</Heading>
        {sentReport ? (
          <View>
            <Heading color="success.500" style={{ textAlign: "center" }} fontSize="md">
              {t("error:error_report_sent_title")}
            </Heading>
            <Text color="success.500" style={{ textAlign: "center" }} fontSize="md">
              {t("error:error_report_sent_description")}
            </Text>
          </View>
        ) : (
          <Button
            onPress={async () => {
              await fetch(`${baseURL}/report`, {
                method: "POST",
                body: JSON.stringify({
                  reports: [...(customErrors ?? []), ...(data ?? [])].map(i =>
                    i.error instanceof Error ? i.error.toString() : i.error
                  ),
                }),
              });
              setSentReport(true);
            }}
            style={{ margin: 4 }}
            color="warning.500"
            startIcon={<Icon colorBlank name="message-alert" style={{ height: 24 }} />}>
            {t("error:error_report")}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      bg={bg === false ? undefined : bg ?? "regularGray.100"}
      _dark={{ bg: darkBg === false ? undefined : darkBg ?? "regularGray.900" }}
      onLayout={onLayout}
      style={Skeleton ? { flex: 1 } : { flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={theme.colors.primary[500]} size={24} />
    </Box>
  );
}
