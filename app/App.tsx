import loadable from "@loadable/component";
import React from "react";
import "react-native-gesture-handler";

import * as TaskManager from "expo-task-manager";
import { LocationObject } from "expo-location";
import { getExpoPushTokenAsync } from "expo-notifications";
import baseURL from "./baseURL";

TaskManager.defineTask("BACKGROUND_LOCATION", async ({ data, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  }
  if (data) {
    const locs = ((data as any).locations.slice() as LocationObject[]).sort(
      (a, b) => b.timestamp - a.timestamp
    );
    await fetch(`${baseURL}/notifications/location`, {
      method: "POST",
      body: JSON.stringify({
        latitude: locs[0].coords.latitude,
        longitude: locs[0].coords.longitude,
        token: (
          await getExpoPushTokenAsync({
            experienceId: "@sohcah/PaperZee",
          })
        ).data,
      }),
    });
  }
});

const AppBase = loadable(() => import("./AppBase"));

export default function App() {
  return (
    <AppBase />
  );
}
