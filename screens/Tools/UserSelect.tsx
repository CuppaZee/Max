import { useState } from "react";
import { useAccounts } from "../../hooks/useToken";

export default function useUsernameSelect() {
  const accounts = useAccounts();
  const [username, setUsername] = useState(
    accounts[0]?.username ?? "-- Select a User --"
  );
  return [
    username === "-- Select a User --" ? undefined : username,
    {
      value: username || "",
      onValueChange: (value: string) => setUsername(value),
      options: accounts.map(i => ({
        value: i.username,
        label: i.username,
      })),
    },
  ] as const;
}
