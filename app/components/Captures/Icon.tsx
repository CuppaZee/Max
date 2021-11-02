import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Type } from "@cuppazee/db";
import TypeImage from "../Common/TypeImage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "../Common/Icon";
import { NavProp } from "../../navigation";
import { Box, Button, Heading, Popover, Text } from "native-base";

export type CapturesIconProps = {
  type?: Type;
  icon?: string;
  count: number;
};

export function CapturesIcon({ type, count, icon }: CapturesIconProps) {
  const { t } = useTranslation();
  const nav = useNavigation<NavProp>();
  return (
    <Popover
      trigger={triggerProps => (
        <Pressable {...triggerProps}>
          <Box style={[styles.card, { opacity: count > 0 ? 1 : 0.2 }]}>
            <TypeImage icon={type?.icon ?? icon ?? ""} style={{ size: 32 }} />
            <Heading numberOfLines={1} ellipsizeMode="tail" fontSize="xs">
              {type?.name ?? icon ?? ""}
            </Heading>
            <Text fontSize="sm">{count}</Text>
          </Box>
        </Pressable>
      )}>
      <Popover.Content
        bg="regularGray.300"
        _dark={{ bg: "regularGray.700" }}
        style={{ padding: 4 }}>
        <TypeImage icon={type?.icon ?? icon ?? ""} style={{ size: 64, alignSelf: "center" }} />
        <Heading style={{ textAlign: "center" }} fontSize="md">
          {count.toLocaleString()}x {type?.name ?? icon ?? ""}
        </Heading>
        <Button
          m="1"
          onPress={() =>
            nav.navigate("Tools_TypeMunzee", {
              type: type?.icon ?? icon ?? "",
            })
          }
          startIcon={<Icon colorBlank style={{ height: 24, width: 24 }} name="database" />}>
          {t("user_activity:type_info")}
        </Button>
      </Popover.Content>
    </Popover>
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
