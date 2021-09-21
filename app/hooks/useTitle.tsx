import React from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { NavProp } from "../navigation";
import { HeaderTitle } from "../navigation/Header";
import { Platform } from "react-native";

export default function useTitle(title: string) {
  const nav = useNavigation<NavProp>();
  const pageOpen = useIsFocused();
  useEffect(() => {
    if (pageOpen) {
      if (Platform.OS === "web") {
        nav.setOptions({
          title: `☕ ${title}`,
          headerTitle: () => <HeaderTitle title={title} />,
        });
      } else {
        nav.setOptions({ title });
      }
    }
  }, [nav, pageOpen, title])
  return;
};