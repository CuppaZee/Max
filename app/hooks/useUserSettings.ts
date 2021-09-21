import { useAtom } from "jotai";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import useDB from "./useDB";
import {settingAtom} from "./useSetting";
import { primaryAccountAtom } from "./useToken";

export const __internal__localSettingsAtom = settingAtom<Partial<UserSettings>>("local_settings", {});

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
  colours: {[name: string]: string}
}

const baseURL = "https://server.cuppazee.app";

const getSettings = async (teaken: string, user_id: number): Promise<{ data: UserSettings }> => {
  const response = await fetch(
    `${baseURL}/auth/settings/v1?teaken=${encodeURIComponent(teaken)}&user_id=${encodeURIComponent(
      user_id
    )}`
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

const updateSettings = async (
  teaken: string,
  user_id: number,
  settings: Partial<UserSettings>
): Promise<{ data: boolean }> => {
  const response = await fetch(`${baseURL}/auth/settings/save/v1`, {
    method: "POST",
    body: JSON.stringify({
      teaken,
      user_id,
      settings,
    }),
  });
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

export function use__internal__CloudUserSettings(): (UserSettings & { query?: UseQueryResult }) | null {
  const [account] = useAtom(primaryAccountAtom);

  const data = useQuery(
    ["user_settings", account?.cuppazee_token, account?.user_id],
    () => (account?.cuppazee_token ? getSettings(account.cuppazee_token, account.user_id) : null),
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
  update: (value: UserSettings[T]) => void,
  isLocal: boolean,
  makeLocal: () => void,
  makeCloud: (
    mergeValues?: (
      local: Partial<UserSettings>[T],
      cloud: Partial<UserSettings>[T]
    ) => UserSettings[T]
  ) => void
] {
  const [localSettings, setLocalSettings] = useAtom(__internal__localSettingsAtom);
  const userSettings = use__internal__UserSettings();
  const cloudUserSettings = use__internal__CloudUserSettings();
  const userSettingsMutation = use__internal__UserSettingsMutation();

  return [
    userSettings?.[key] ?? null,
    value => {
      userSettingsMutation({ ...userSettings, [key]: value });
    },
    !!localSettings[key],
    () => {
      setLocalSettings({ ...localSettings, [key]: userSettings?.[key] });
    },
    mergeValues => {
      const { [key]: _, ...ls } = localSettings;
      setLocalSettings(ls);
      if (mergeValues) {
        userSettingsMutation({
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
        const d = await updateSettings(account?.cuppazee_token, account.user_id, settings);
        client.refetchQueries(["user_settings"]);
        return d;
      }
      return { data: false };
    }
  );

  return (settings: Partial<UserSettings>, forceUpdateCloud?: boolean) => {
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
      mutation.mutate(update);
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
