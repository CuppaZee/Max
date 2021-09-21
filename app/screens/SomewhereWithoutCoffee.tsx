import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import Icon from "../components/Common/Icon";
import useTitle from "../hooks/useTitle";
import { NavProp } from "../navigation";
import {Box, Button, Heading} from "native-base";

export default function SomewhereWithoutCoffeeScreen() {
  const { t } = useTranslation();
  useTitle(`❌ Coffee Not Found`);
  const theme = useTheme();
  const nav = useNavigation<NavProp>();
  return (
    <Box bg="regularGray.100" _dark={{bg: "regularGray.900"}} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        source={
          theme.style === "dark"
            ? require("../assets/images/404.png")
            : require("../assets/images/404-light.png")
        }
        style={{ width: 300, height: 100 }}
      />
      <Heading fontSize="lg">{t("404:title")}</Heading>
      <Heading fontSize="md">{t("404:subtitle")}</Heading>
      <Button
        onPress={() => nav.navigate("Player_Profile", {username: "_"})}
        size="lg"
        startIcon={<Icon colorBlank style={{ height: 24 }} name="home" />}>
        {t("404:home")}
      </Button>
    </Box>
  );
}
