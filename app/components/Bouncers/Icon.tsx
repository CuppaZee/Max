import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Type } from "@cuppazee/db";
import TypeImage from "../Common/TypeImage";
import { useNavigation } from "@react-navigation/native";
import { Box, Heading, Text } from "native-base";
import { NavProp } from "../../navigation";

export type BouncerIconProps = {
  type?: Type;
  icon?: string;
  count: number;
};

export function BouncerIcon({ type, count, icon }: BouncerIconProps) {
  const nav = useNavigation<NavProp>()
  return (
    <Pressable onPress={(() => nav.navigate("Tools_BouncersMap",
      {
        type: type?.icon ?? icon?.slice(49, -4) ?? ""
      }))}>
      <Box bg="regularGray.200" _dark={{bg: "regularGray.800"}} style={[styles.card, { opacity: count > 0 ? 1 : 0.2 }]}>
        <TypeImage icon={type?.icon ?? icon ?? ""} style={{ size: 32 }} />
        <Heading numberOfLines={1} ellipsizeMode="tail" fontSize="xs">
          {type?.name ?? icon?.slice(49, -4) ?? ""}
        </Heading>
        <Text fontSize="sm">{count}</Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 4,
    alignItems: "center",
    width: 80,
    flexGrow: 1,
  },
});
