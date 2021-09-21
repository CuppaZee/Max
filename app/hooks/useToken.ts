import { useQuery } from "react-query";
import { useAtom } from "jotai";
import baseURL from "../baseURL";
import {useMemo} from "react";
import { settingAtom } from "./useSetting";

const getToken = async (teaken: string, user_id: number) => {
  const response = await fetch(
    `${baseURL}/auth/get/v2?teaken=${encodeURIComponent(
      teaken
    )}&user_id=${encodeURIComponent(user_id)}`
  );
  return await response.json();
};

export type AccountData = {
  cuppazee_token: string;
  username: string;
  user_id: number;
};

export const primaryAccountAtom = settingAtom<AccountData | null>(
  "@cz3/accounts/primary",
  null,
  "replace"
);

export const otherAccountsAtom = settingAtom<AccountData[]>("@cz3/accounts/other", [], "replace");

export function useAccounts(): AccountData[] {
  const [primaryAccount] = useAtom(primaryAccountAtom);
  const [otherAccounts] = useAtom(otherAccountsAtom);
  if (primaryAccount) {
    return [primaryAccount, ...otherAccounts];
  }
  return [];
}

export default function useToken(user_id?: number) {
  const [primaryAccount] = useAtom(primaryAccountAtom);
  const [otherAccounts] = useAtom(otherAccountsAtom);
  const account = useMemo(() => {
    if (user_id === undefined || Number(primaryAccount?.user_id) === user_id) {
      return primaryAccount ?? null;
    }
    return otherAccounts.find(i => Number(i.user_id) === user_id) ?? null;
  }, [primaryAccount, otherAccounts, user_id]);
  const data = useQuery(
    ["token", account?.cuppazee_token, account?.user_id ?? user_id],
    () => getToken(account?.cuppazee_token ?? "", account?.user_id ?? 0),
    {
      enabled: account !== null,
    }
  );
  return {
    status: account ? (data.data?.executed_in ? (data.data?.data?.access_token ? "valid" : "expired") : (data.isLoading ? "loading" : "failed")) : "missing",
    user_id: account?.user_id ?? user_id,
    token: data.data?.data,
  };
}
