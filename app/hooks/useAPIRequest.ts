import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import stringify from "fast-json-stable-stringify";
import useToken, { AuthenticationResult, TokenStatus } from "./useToken";
import { useEffect, useRef } from "react";
import { baseAPIURL } from "../baseURLs";
import { useIsFocused } from "@react-navigation/core";

const getAPIData = async <D>(
  endpoint: string,
  parameters: { [key: string]: { toString(): string } | undefined },
  access_token: string,
  cuppazee_token: string,
  method?: "get" | "post"
): Promise<D> => {
  const params: { [key: string]: { toString(): string } | undefined } = {
    ...parameters,
    access_token,
    cuppazee_token,
  };
  let response;
  try {
    if (method === "post") {
      response = await fetch(
        baseAPIURL +
          endpoint?.replace(/{([A-Za-z0-9_]+)}/g, string => {
            return encodeURIComponent(params?.[string.slice(1, -1)]?.toString() ?? "");
          }),
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      );
    } else {
      response = await fetch(
        baseAPIURL +
          endpoint?.replace(/{([A-Za-z0-9_]+)}/g, string => {
            return encodeURIComponent(params?.[string.slice(1, -1)]?.toString() ?? "");
          }) +
          (endpoint.includes("?") ? (endpoint.endsWith("?") ? "" : "&") : "?") +
          Object.entries(params)
            .map(i => `${encodeURIComponent(i[0])}=${encodeURIComponent(i[1]?.toString() ?? "")}`)
            .join("&"),
        {
          method: "GET",
        }
      );
    }
  } catch (e) {
    const error: APIError = {
      type: APIErrorType.Connection,
      message: "Unable to connect to CuppaZee API",
    };
    throw error;
  }

  // TODO: FROM value
  let data;
  try {
    data = await response.json();
  } catch (e) {
    const error: APIError = {
      type: APIErrorType.Unexpected,
      message: "Unexpected error when connecting to CuppaZee API",
    };
    throw error;
  }
  if (data.error) {
    const error: APIError = data.error;
    throw error;
  }
  return data;
};

export enum APIErrorType {
  Unexpected = "UNEXPECTED",
  Munzee = "MUNZEE",
  Authentication = "AUTHENTICATION",
  NotFound = "NOTFOUND",
  Unavailable = "UNAVAILABLE",
  InvalidRequest = "INVALIDREQUEST",
  Connection = "CONNECTION",
}

export interface APIAuthenticationDetails {
  user_id?: number;
  username?: string;
}

export interface APIError {
  message: string;
  type: APIErrorType;
  authentication_details?: APIAuthenticationDetails;
}

export interface APIResponse<D> {
  data?: D;
  error?: APIError;
  statusCode: number;
  executedIn: number;
}

export interface useAPIDataParams<D> {
  endpoint: string;
  params: { [key: string]: { toString(): string } | undefined };
  method?: "get" | "post";
  user_id?: number;
  options?: UseQueryOptions<APIResponse<D>, APIError>;
  bypassIsFocused?: boolean;
}

export type useAPIDataResponse<D> = UseQueryResult<APIResponse<D>, APIError> & {
  authenticationStatus: TokenStatus;
  authentication?: AuthenticationResult;
};

export default function useAPIData<D>(
  params: useAPIDataParams<D>
): useAPIDataResponse<D> {
  const token = useToken(params.user_id);
  const isFocused = params.bypassIsFocused ?? useIsFocused();
  const lastToken = useRef<string | null>(null);
  const data = useQuery<APIResponse<D>, APIError>(
    [params.endpoint, stringify(params.params), params.user_id],
    async () => {
      const responseData = await getAPIData(
        params.endpoint,
        params.params,
        token?.token?.access_token ?? "",
        token.account?.cuppazee_token ?? "",
        params.method ?? "get"
      );
      // if (responseData?.status_code === 403) {
      //   refetchToken();
      // }
      return responseData as APIResponse<D>;
    },
    {
      ...params.options,
      enabled: !!token?.token?.access_token && isFocused && (params.options?.enabled ?? true),
    }
  );
  useEffect(() => {
    if ((token?.token?.access_token ?? null) !== lastToken.current && lastToken.current) {
      data.refetch();
    }
    lastToken.current = token?.token?.access_token ?? null;
  }, [token]);
  return {
    ...data,
    authenticationStatus: token.status,
    authentication: token.token,
  };
}
