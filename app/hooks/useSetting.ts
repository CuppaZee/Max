import { MMKV } from "./mmkv/index";
import {useAtom} from "jotai";
import builds from "../builds";
import {CuppaZeeDB} from "@cuppazee/db";
import {atomWithStorage} from "jotai/utils";

export const store = new MMKV();

const MergeStorage = (initialData: any) => ({
  getItem: (key: string) => {
    console.log(key);
    const jsonString = store.getString(key);
    if (!jsonString) return initialData;
    try {
      const data = JSON.parse(jsonString);
      return {...initialData, ...data};
    } catch {
      return initialData;
    }
  },
  setItem: (key: string, data: any) => {
    const stringified = JSON.stringify(data);
    if (stringified !== undefined) {
      store.set(key, stringified);
    } else {
      store.delete(stringified);
    }
  },
  delayInit: true,
});

const ReplaceStorage = (initialData: any) => ({
  getItem: (key: string) => {
    const jsonString = store.getString(key);
    if (!jsonString) return initialData;
    try {
      const data = JSON.parse(jsonString);
      return data;
    } catch {
      return initialData;
    }
  },
  setItem: (key: string, data: any) => {
    const stringified = JSON.stringify(data);
    if (stringified !== undefined) {
      store.set(key, stringified);
    } else {
      store.delete(stringified);
    }
  },
  delayInit: true,
});

export function settingAtom<T>(key: string, initialData: T, loadMethod?: "merge" | "replace") {
  const method = loadMethod ?? ((typeof initialData === "object" && !Array.isArray(initialData)) ? "merge" : "replace");
  return atomWithStorage<T>(
    key,
    initialData,
    (method === "merge" ? MergeStorage : ReplaceStorage)(initialData),
  )
}

export interface Setting<T> {
  data: T;
  loaded: boolean;
}

export const BuildAtom = settingAtom<number>(
  "@cz3/build",
  builds(new CuppaZeeDB([], [], []))[builds(new CuppaZeeDB([], [], [])).length - 1].build - 1
);

export const ThemeAtom = settingAtom<string>(
  "@cz3/personalisation/theme",
  "green_light"
);

export const ClanPersonalisationAtom = settingAtom<{
  style: number;
  reverse: boolean;
  single_line: boolean;
  full_background: boolean;
  colours: string[];
  edited: boolean;
}>(
  "@cz3/personalisation/clan",
  {
    style: 2,
    reverse: false,
    single_line: false,
    full_background: false,
    edited: false,
    colours: [
      "#eb0000",
      "#ef6500",
      "#fa9102",
      "#fcd302",
      "#bfe913",
      "#55f40b",
      "#0cf4af",
      "",
      "",
      "",
      "",
      "#FFE97F",
      "#DFF77E",
      "#B0FC8D",
    ],
  }
);

export const ClansAtom = settingAtom<{
  [clan_id: string]: {
    level: number;
    share: boolean;
    subtract: boolean;
    shadow: boolean;
  };
}>(
  "@cz3/clans",
  {}
);

export const TipsAtom = settingAtom<{
  [id: string]: {
    time: number;
    count: number;
  };
}>(
  "@cz3/tips",
  {}
);

export const ReadyAtom = settingAtom<string | false>(
  "@cz3/ready",
  false
);

export const LiveLocationErrorAtom = settingAtom<"" | "permission_failed" | "updated" | "updated_native">(
  "@cz3/errors/live_location",
  ""
);

export const DrawerAtom = settingAtom<{
  open?: boolean;
  collapsed: boolean;
}>(
  "@cz3/personalisation/drawer",
  {
    open: true,
    collapsed: false,
  }
);

export const MapStyleAtom = settingAtom<"monochrome" | "streets" | "satellite">(
  "@cz3/personalisation/maps",
  "monochrome"
);

export const CumulativeRewardsAtom = settingAtom<boolean>(
  "@cz3/clan/cumulative_rewards",
  false
);

export const SkipDashboardAtom = settingAtom<boolean>(
  "@cz3/skipdashboard",
  false
);

export default useAtom;