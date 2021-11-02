import * as React from "react";
import { FlatList } from "react-native";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useSearch from "../../hooks/useSearch";
import useTitle from "../../hooks/useTitle";
import Fuse from "fuse.js";
import Tip from "../../components/Common/Tip";
import { useTranslation } from "react-i18next";
import useDB from "../../hooks/useDB";
import { Box, Heading, Input } from "native-base";
import { Item } from "../../components/Common/Item";
import { useHeaderHeight } from "@react-navigation/elements";

export default function SearchScreen() {
  const db = useDB();
  const { t } = useTranslation();
  useTitle(`${t("pages:tools_search")}`);
  const [value, search, onValue] = useSearch(500);
  const users = useMunzeeRequest("user/find", { text: search }, true, undefined, true, {
    keepPreviousData: true,
  });
  const clans = useCuppaZeeRequest("clan/list", { format: "list" }, true, undefined, true, {
    keepPreviousData: true,
  });

  const fuse = React.useMemo(
    () =>
      new Fuse(
        [
          ...(clans.data?.data ?? []),
          ...db.types,
          ...db.categories,
          ...(users.data?.data?.users ?? []),
        ],
        {
          keys: ["name", "username", "icon", "id", "user_id", "clan_id"],
        }
      ),
    [clans.dataUpdatedAt, users.dataUpdatedAt]
  );
  const headerHeight = useHeaderHeight();
  const results = React.useMemo(() => fuse.search(search, { limit: 50 }), [fuse, search]);

  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      p={1}
      flex={1}
      style={{ paddingTop: headerHeight + 4 }}>
      <Box style={{ margin: 4, width: 400, maxWidth: "100%", alignSelf: "center" }}>
        <Heading fontSize="md">{t("search:search")}</Heading>
        <Input value={value} onChangeText={onValue} />
      </Box>

      {!search && (
        <Tip
          wrapperStyle={{ margin: 4, width: 400, maxWidth: "100%", alignSelf: "center" }}
          tip="As well as searching for Players and Clans, you can also look up Munzee Types here to find out more about them!"
          id="search_munzee_types"
        />
      )}

      <FlatList
        style={{
          flex: 1,
          width: 400,
          maxWidth: "100%",
          alignSelf: "center",
          margin: 4,
          borderRadius: 8,
        }}
        windowSize={2}
        data={results}
        renderItem={({ item }: { item: typeof results[0]; index: number }) => {
          let link: any;
          if ("user_id" in item.item) {
            link = [
              "Player_Profile",
              {
                username: item.item.username,
              },
            ] as const;
          } else if ("clan_id" in item.item) {
            link = [
              "Clan_Stats",
              {
                clanid: item.item.clan_id,
              },
            ] as const;
          } else if ("category" in item.item) {
            link = [
              "Tools_TypeMunzee",
              {
                type: item.item.icon,
              },
            ] as const;
          } else {
            link = [
              "Tools_TypeCategory",
              {
                category: item.item.id,
              },
            ] as const;
          }
          return (
            <Item
              link={link}
              typeImage={"icon" in item.item ? item.item.icon : undefined}
              imageRounded={!("icon" in item.item)}
              image={
                "icon" in item.item
                  ? undefined
                  : "user_id" in item.item
                  ? `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                      item.item.user_id
                    ).toString(36)}.png`
                  : `https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                      item.item.clan_id
                    ).toString(36)}.png`
              }
              title={item.item.username ?? item.item.name}
              subtitle={
                "icon" in item.item
                  ? "category" in item.item
                    ? t("search:type")
                    : t("search:category")
                  : "user_id" in item.item
                  ? t("search:player")
                  : t("search:clan")
              }
            />
          );
        }}
      />
    </Box>
  );
}
