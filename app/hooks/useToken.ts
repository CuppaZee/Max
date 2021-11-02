import { useQuery } from "react-query";
import { useAtom } from "jotai";
import {baseAPIURL} from "../baseURLs";
import {useMemo} from "react";
import { settingAtom } from "./useSetting";

const getToken = async (token: string, user_id: number) => {
  const response = await fetch(
    `${baseAPIURL}/auth/get?token=${encodeURIComponent(token)}&user_id=${encodeURIComponent(
      user_id
    )}`
  );
  return await response.json();
};

export type AccountData = {
  cuppazee_token: string;
  username: string;
  user_id: number;
};

export const primaryAccountAtom = settingAtom<AccountData | null>(
  "@cz3/auth/accounts/primary",
  null,
  "replace",
  false
);

export const otherAccountsAtom = settingAtom<AccountData[]>("@cz3/auth/accounts/other", [], "replace");

export function useAccounts(): AccountData[] {
  const [primaryAccount] = useAtom(primaryAccountAtom);
  const [otherAccounts] = useAtom(otherAccountsAtom);
  if (primaryAccount) {
    return [primaryAccount, ...otherAccounts];
  }
  return [];
}

export enum TokenStatus {
  Valid = "valid",
  Expired = "expired",
  Failed = "failed",
  Loading = "loading",
  Missing = "missing",
}

export interface AuthenticationResult {
  access_token: string;
  token_type: "Bearer";
  expires: number;
  expires_in: number;
}

export interface useTokenResponse {
  status: TokenStatus;
  user_id?: number;
  token?: AuthenticationResult;
  account: AccountData | null;
}

export default function useToken(user_id?: number): useTokenResponse {
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
    status: account
      ? data.data?.executedIn
        ? data.data?.data?.access_token
          ? TokenStatus.Valid
          : TokenStatus.Expired
        : data.isLoading
        ? TokenStatus.Loading
        : TokenStatus.Failed
      : TokenStatus.Missing,
    user_id: account?.user_id ?? user_id,
    token: data.data?.data,
    account,
  };
}
