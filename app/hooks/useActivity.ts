import { StatzeePlayerDay } from "@cuppazee/api/statzee/player/day";
import dayjs from "dayjs";
import useCuppaZeeRequest from "./useCuppaZeeRequest";
import useMunzeeRequest from "./useMunzeeRequest";
import useToken from "./useToken";

export default function useActivity(user_id?: number, day?: string) {
  const token = useToken(user_id);
  const cuppazee = useCuppaZeeRequest<{ data: StatzeePlayerDay["response"]["data"] }>(
    "user/activity",
    {
      user_id,
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    user_id !== undefined && token.status === "missing"
  );
  const munzee = useMunzeeRequest(
    "statzee/player/day",
    {
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    user_id !== undefined && token.status !== "missing" && token.status !== "loading",
    user_id
  );
  return token.status !== "missing" ? munzee : cuppazee;
}