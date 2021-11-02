import { atom, useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "react-query";
import { baseAPIURL } from "../baseURLs";
import useDB from "./useDB";
import { settingAtom } from "./useSetting";
import { primaryAccountAtom } from "./useToken";

export const __internal__localSettingsAtom = settingAtom<Partial<UserSettings>>(
  "local_settings",
  {}
);

export interface UserSettingsUser {
  user_id: number;
  username: string;
}
export interface UserSettingsClan {
  clan_id: number;
  name: string;
  tagline: string;
}

export interface UserSettings {
  users: UserSettingsUser[];
  clans: UserSettingsClan[];
  rootCategories: string[];
  colours: { [name: string]: string };
}

const baseURL = "https://server.cuppazee.app";

const getSettings = async (cuppazee_token: string): Promise<{ data: UserSettings }> => {
  const response = await fetch(
    `${baseAPIURL}/auth/settings/get?token=${encodeURIComponent(cuppazee_token)}`
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

const updateSettings = async (
  cuppazee_token: string,
  settings: Partial<UserSettings>
): Promise<{ data: boolean }> => {
  const response = await fetch(
    `${baseAPIURL}/auth/settings/set?token=${encodeURIComponent(cuppazee_token)}`,
    {
      method: "POST",
      body: JSON.stringify({
        cuppazee_token,
        settings: JSON.stringify(settings),
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

export function use__internal__CloudUserSettings():
  | (UserSettings & { query?: UseQueryResult })
  | null {
  const [account] = useAtom(primaryAccountAtom);

  const data = useQuery(
    ["user_settings", account?.cuppazee_token],
    () => (account?.cuppazee_token ? getSettings(account.cuppazee_token) : null),
    {
      enabled: account?.cuppazee_token !== undefined,
    }
  );

  const serverSettings = data.data?.data ? { ...data.data.data, query: data } : null;

  return serverSettings;
}

function use__internal__UserSettings(): (UserSettings & { query?: UseQueryResult }) | null {
  const [localSettings] = useAtom(__internal__localSettingsAtom);

  const serverSettings = use__internal__CloudUserSettings();

  if (!serverSettings) {
    return null;
  }
  return { ...serverSettings, ...localSettings };
}

export function useUserSetting<T extends keyof UserSettings>(key: T): UserSettings[T] | null {
  const userSettings = use__internal__UserSettings();
  return userSettings?.[key] ?? null;
}

export function useUserSettingMutation<T extends keyof UserSettings>(
  key: T
): [
  value: UserSettings[T] | null,
  update: (value: UserSettings[T]) => Promise<void>,
  isLocal: boolean,
  makeLocal: () => void,
  makeCloud: (
    mergeValues?: (
      local: Partial<UserSettings>[T],
      cloud: Partial<UserSettings>[T]
    ) => UserSettings[T]
  ) => Promise<void>
] {
  const [localSettings, setLocalSettings] = useAtom(__internal__localSettingsAtom);
  const userSettings = use__internal__UserSettings();
  const cloudUserSettings = use__internal__CloudUserSettings();
  const userSettingsMutation = use__internal__UserSettingsMutation();

  return [
    userSettings?.[key] ?? null,
    async value => {
      await userSettingsMutation({ ...userSettings, [key]: value });
    },
    !!localSettings[key],
    () => {
      setLocalSettings({ ...localSettings, [key]: userSettings?.[key] });
    },
    async mergeValues => {
      const { [key]: _, ...ls } = localSettings;
      setLocalSettings(ls);
      if (mergeValues) {
        await userSettingsMutation({
          ...userSettings,
          [key]: mergeValues(localSettings[key], cloudUserSettings?.[key]),
        });
      }
    },
  ];
}

export function use__internal__UserSettingsMutation() {
  const [account] = useAtom(primaryAccountAtom);
  const [localSettings, setLocalSettings] = useAtom(__internal__localSettingsAtom);
  const client = useQueryClient();

  const mutation = useMutation<{ data: boolean }, unknown, Partial<UserSettings>>(
    async settings => {
      if (account) {
        const d = await updateSettings(account?.cuppazee_token, settings);
        client.refetchQueries(["user_settings"]);
        return d;
      }
      return { data: false };
    }
  );

  return async (settings: Partial<UserSettings>, forceUpdateCloud?: boolean) => {
    const updateLocal: Partial<UserSettings> = {};
    const update: Partial<UserSettings> = {};
    for (const key of Object.keys(settings) as (keyof UserSettings)[]) {
      if ((key as any) === "query") continue;
      if (localSettings[key] !== undefined && localSettings[key] !== null && !forceUpdateCloud) {
        updateLocal[key] = settings[key] as any;
      } else {
        update[key] = settings[key] as any;
      }
    }
    if (Object.keys(updateLocal).length > 0) {
      setLocalSettings(updateLocal);
    }
    if (Object.keys(update).length > 0) {
      await mutation.mutateAsync(update);
    }
  };
}

export function useRootCategories() {
  const rootCategories = useUserSetting("rootCategories");
  const db = useDB();
  if (rootCategories && db.categories.length > 0) {
    const allCategories = db.categories
      .filter(i => i.parents.find(i => i?.id === "root"))
      .map(i => i.id);
    const list = rootCategories.filter(i => allCategories.includes(i));
    for (const category of allCategories) {
      if (!list.includes(category)) rootCategories.push(category);
    }
    return list;
  }
  return db.categories.filter(i => i.parents.find(i => i?.id === "root")).map(i => i.id);
}

export const UsersSetAtom = atom(new Set<number>());

export function UsersSetHandler() {
  const users = useUserSetting("users");
  const [_, setUsersSet] = useAtom(UsersSetAtom);
  useEffect(() => {
    setUsersSet(new Set(users?.map(i => i.user_id)));
  }, []);
  return null;
}