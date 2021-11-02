import { Button, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, View } from "react-native";
import Icon from "../../components/Common/Icon";
import useLogin from "../../hooks/useLogin";
import useSetting, { ReadyAtom } from "../../hooks/useSetting";
import useTitle from "../../hooks/useTitle";
import { useAccounts } from "../../hooks/useToken";

export default function AccountsScreen() {
  const { t } = useTranslation();
  useTitle(`${t("pages:settings")} - ${t("pages:settings_accounts")}`);
  const [, login, ready] = useLogin("settings/accounts");
  const accounts = useAccounts();
  const [, setReady] = useSetting(ReadyAtom);
  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignSelf: "center", width: 400, maxWidth: "100%", padding: 4 }}>
        {accounts.map(i => (
          <Layout
            level="3"
            style={{
              margin: 4,
              borderRadius: 8,
            }}>
            <View
              style={{
                padding: 8,
                flexDirection: "row",
                alignItems: "center",
              }}>
              <Image
                style={{ height: 32, width: 32, borderRadius: 16, marginRight: 8 }}
                source={{
                  uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                    i.user_id
                  ).toString(36)}.png`,
                }}
              />
              <Text category="h6">{i.username}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button
                style={{ margin: 4, flex: 1 }}
                size="small"
                appearance="ghost"
                onPress={login}
                disabled={!ready}
                accessoryLeft={props => <Icon {...props} name="refresh" />}>
                {t("settings_accounts:reauthenticate")}
              </Button>
              <Button
                style={{ margin: 4, flex: 1 }}
                size="small"
                status="danger"
                appearance="ghost"
                onPress={() => {
                  // setTeakens({
                  //   ...teakens,
                  //   data: Object.fromEntries(
                  //     Object.entries(teakens.data).filter(t => t[0] !== i[0])
                  //   ),
                  // });
                  // if (Object.entries(teakens.data).filter(t => t[0] !== i[0]).length === 0) {
                  //   setReady(false);
                  // }
                }}
                accessoryLeft={props => <Icon {...props} name="logout" />}>
                {t("settings_accounts:logout")}
              </Button>
            </View>
          </Layout>
        ))}
      </ScrollView>
      <View style={{ width: 400, maxWidth: "100%", padding: 4, alignSelf: "center" }}>
        <Button
          style={{ margin: 4 }}
          onPress={login}
          disabled={!ready}
          appearance="outline"
          accessoryLeft={props => <Icon {...props} name="account-plus" />}>
          {t("settings_accounts:add_account")}
        </Button>
      </View>
    </Layout>
  );
}
