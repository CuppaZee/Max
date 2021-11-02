import { StatzeePlayerDay } from "@cuppazee/api/statzee/player/day";
import dayjs from "dayjs";
import useAPIData from "./useAPIRequest";
import useMunzeeRequest from "./useMunzeeRequest";
import useToken, { TokenStatus } from "./useToken";

export default function useActivity(user_id?: number, day?: string) {
  const token = useToken(user_id);
  const api = useAPIData<StatzeePlayerDay["response"]["data"]>({
    endpoint: "/user/activity",
    params: {
      user_id,
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    options: {
      enabled: user_id !== undefined && token.status === TokenStatus.Missing,
    },
  });
  const munzee = useMunzeeRequest(
    "statzee/player/day",
    {
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    user_id !== undefined && token.status !== "missing" && token.status !== "loading",
    user_id
  );
  return token.status !== "missing" ? munzee : api;
}
