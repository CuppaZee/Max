import * as React from "react";
import { Alert, AppState, Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAtom } from "jotai";
import * as ExpoClipboard from "expo-clipboard";
import { otherAccountsAtom, primaryAccountAtom } from "./useToken";
import { UserSettingsUser, useUserSettingMutation } from "./useUserSettings";
const configs = {
  main: {
    redirect_uri: "https://server.cuppazee.app/auth/auth/v1",
    client_id: "91714935879f433364bff187bda66183",
  },
  dev: {
    redirect_uri: "http://nextserver.cuppazee.app/auth/auth/v1",
    client_id: "628ed7ab83b0a6f59674f1bf04e4afa2",
  },
  team: {
    client_id: "c983d59354542f8d15e11924ed61bae6",
    redirect_uri: "https://server.cuppazee.app/auth/auth/team/v1",
  },
  universal: {
    client_id: "64f148f57d1d7c62e44a90e5f3661432",
    redirect_uri: "https://server.cuppazee.app/auth/auth/universal/v1",
  },
};

WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: true,
});

export default function useLogin(
  path: string,
  application: keyof typeof configs = "main"
) {
  const redirectUri =
    Platform.OS === "web"
      ? [window.location.origin, path].filter(Boolean).join("/").replace(/\/\//g, "/")
      : `uk.cuppazee.paper://${path}`;

  var config = configs[application];
  const [primaryAccount, setPrimaryAccount] = useAtom(primaryAccountAtom);
  const [otherAccounts, setOtherAccounts] = useAtom(otherAccountsAtom);

  const [users, setUsers] = useUserSettingMutation("users");
  const [queuedAccounts, setQueuedAccounts] = React.useState<UserSettingsUser[]>([]);


  React.useEffect(() => {
    if (queuedAccounts.length > 0 && users) {
      const updatedUsers = users.slice();
      for (const account of queuedAccounts) {
        if (!updatedUsers.find(i => i.user_id === account.user_id)) {
          updatedUsers.push(account);
        }
      }
      if (updatedUsers.length !== users.length) {
        setUsers(updatedUsers);
      }
      setQueuedAccounts([]);
    }
  }, [queuedAccounts, users]);

  const [loading, setLoading] = React.useState<boolean>(Platform.OS === "android");
  const [mode, setMode] = React.useState<"loading" | "authSession" | "browserClipboard">(
    Platform.OS === "android" ? "loading" : "authSession"
  );

  React.useEffect(() => {
    if (mode === "loading") {
      WebBrowser.getCustomTabsSupportingBrowsersAsync()
        .then(i => {
          if (i.browserPackages.length > 0) {
            setMode("authSession");
          }
          setMode("browserClipboard");
        })
        .catch(() => {
          setMode("browserClipboard");
        });
    }
  }, [mode]);

  React.useEffect(() => {
    async function checkClipboard() {
      if (Platform.OS === "android") {
        const string = await ExpoClipboard.getStringAsync();
        if (string?.startsWith("czlogin:")) {
          const s = string.split(":");
          handleLogin({
            teaken: s[1],
            username: s[2],
            user_id: s[3],
          });
        }
      }
    }
    AppState.addEventListener("change", checkClipboard);

    return () => {
      AppState.removeEventListener("change", checkClipboard);
    };
  }, []);

  async function handleLogin(params: any) {
    if (!params?.teaken) return setLoading(false);

    if (primaryAccount) {
      setOtherAccounts([
        ...otherAccounts.filter(i => i.username !== params.username),
        {
          user_id: Number(params.user_id),
          username: params.username,
          cuppazee_token: params.teaken,
        },
      ]);
    } else {
      setPrimaryAccount({
        user_id: Number(params.user_id),
        username: params.username,
        cuppazee_token: params.teaken,
      });
    }

    setQueuedAccounts(i => [
      ...i,
      {
        username: params.username,
        user_id: Number(params.user_id),
      },
    ]);

    setLoading(false);
  }

  async function login() {
    if (mode === "browserClipboard") {
      const string = await ExpoClipboard.getStringAsync();
      if (string?.startsWith("czlogin:")) {
        const s = string.split(":");
        handleLogin({
          teaken: s[1],
          username: s[2],
          user_id: s[3],
        });
      }
      Linking.openURL(
        `https://api.munzee.com/oauth?client_id=${encodeURIComponent(
          config.client_id
        )}&redirect_uri=${encodeURIComponent(
          config.redirect_uri
        )}&response_type=code&scope=read&state=${encodeURIComponent(
          JSON.stringify({
            redirect: redirectUri,
            platform: Platform.OS,
            max_alt: true,
          })
        )}`
      );
    } else if (mode === "authSession") {
      try {
        setLoading(true);
        const response = await WebBrowser.openAuthSessionAsync(
          `https://api.munzee.com/oauth?client_id=${encodeURIComponent(
            config.client_id
          )}&redirect_uri=${encodeURIComponent(
            config.redirect_uri
          )}&response_type=code&scope=read&state=${encodeURIComponent(
            JSON.stringify({
              redirect: redirectUri,
              platform: Platform.OS,
            })
          )}`,
          redirectUri
        );
        if (response.type !== "success") {
          setLoading(false);
        } else {
          const params = Object.fromEntries(
            response.url
              .split("?")?.[1]
              .split("&")
              .map(i => i.split("=").map(i => decodeURIComponent(i))) ?? []
          );
          await handleLogin(params);
        }
      } catch (e) {
        setLoading(false);
        if (Platform.OS === "web") {
          alert("Something went wrong when logging in.");
        } else {
          Alert.alert("Something went wrong when logging in.");
        }
      }
    }
  }

  return [loading, login, !loading, mode, handleLogin] as const;
}
