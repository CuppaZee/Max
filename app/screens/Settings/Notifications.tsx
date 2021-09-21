import {
  Button,
  CheckBox,
  Input,
  Layout,
  List,
  ListItem,
  Modal,
  Spinner,
  Text,
} from "@ui-kitten/components";
import * as React from "react";
import { Platform, ScrollView, View, Image, NativeModules } from "react-native";
import useTitle from "../../hooks/useTitle";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as Application from "expo-application";
import { TypeTags } from "@cuppazee/db";
import TypeImage from "../../components/Common/TypeImage";
import useSearch from "../../hooks/useSearch";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { LANGS } from "../../lang/i18n";
import Select from "../../components/Common/Select";
import Icon from "../../components/Common/Icon";
import useSetting, { LiveLocationErrorAtom } from "../../hooks/useSetting";
import Loading from "../../components/Loading";
import { LocationPickerMap } from "../../components/Map/Map";
import baseURL from "../../baseURL";
import useDB from "../../hooks/useDB";
import { Heading } from "native-base";

interface LocationPickerModalProps {
  location: DeviceNotificationStaticLocation;
  close: () => void;
  remove: () => void;
}

function LocationPickerModal({ location, close, remove }: LocationPickerModalProps) {
  const { t } = useTranslation();
  return (
    <Layout level="4" style={{ borderRadius: 8, padding: 4 }}>
      <UpdateWrapper>
        {update => (
          <View>
            <Input
              style={{ margin: 4 }}
              label={t("settings_notifications:locations_static_name")}
              value={location.name}
              onChangeText={text => {
                location.name = text;
                update();
              }}
            />
            <View style={{ flex: 1, margin: 4, height: 400, width: 400, maxWidth: "100%" }}>
              <LocationPickerMap
                defaultViewport={{
                  latitude: 0,
                  longitude: 0,
                  zoom: 10,
                }}
                icon="munzee"
                onPositionChange={({ latitude, longitude }) => {
                  location.latitude = latitude.toString();
                  location.longitude = longitude.toString();
                }}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Button
                style={{ margin: 4 }}
                status="danger"
                accessoryLeft={props => <Icon name="delete-forever" {...props} />}
                onPress={remove}
              />
              <Button style={{ margin: 4, flex: 1 }} onPress={close}>
                {t("settings_notifications:locations_static_done")}
              </Button>
            </View>
          </View>
        )}
      </UpdateWrapper>
    </Layout>
  );
}

interface ConfirmLocationModalProps {
  close: () => void;
  confirm: () => void;
}

function ConfirmLocationModal({ confirm, close }: ConfirmLocationModalProps) {
  const { t } = useTranslation();
  return (
    <Layout level="4" style={{ borderRadius: 8, padding: 4, margin: 8 }}>
      <Text category="h6">{t("settings_notifications:locations_live_confirm_title")}</Text>
      <Text category="p1">{t("settings_notifications:locations_live_confirm_description_1")}</Text>
      <Text category="p1">{t("settings_notifications:locations_live_confirm_description_2")}</Text>
      <View style={{ flexDirection: "row" }}>
        <Button
          style={{ margin: 4 }}
          appearance="ghost"
          accessoryLeft={props => <Icon name="close" {...props} />}
          onPress={close}>
          {t("settings_notifications:locations_live_cancel")}
        </Button>
        <Button
          style={{ margin: 4, flex: 1 }}
          status="success"
          accessoryLeft={props => <Icon name="check" {...props} />}
          onPress={confirm}>
          {t("settings_notifications:locations_live_confirm")}
        </Button>
      </View>
    </Layout>
  );
}
interface UserSearchModalProps {
  close: (data: { user_id: number; username: string }) => void;
}

export function UserSearchModal({ close }: UserSearchModalProps) {
  const { t } = useTranslation();
  const [value, search, onValue] = useSearch(500);
  const data = useMunzeeRequest("user/find", { text: search }, true, undefined, true);
  return (
    <Layout level="4" style={{ borderRadius: 8, padding: 4 }}>
      <Input style={{ margin: 4 }} label={t("settings_notifications:starred_users_search")} value={value} onChangeText={onValue} />

      <List
        style={{
          height: 400,
          width: 300,
          margin: 4,
          borderRadius: 8,
          maxWidth: "100%",
          flexShrink: 1,
        }}
        data={data.data?.data?.users ?? []}
        renderItem={({ item, index }) => (
          <ListItem
            accessoryLeft={() => (
              <Image
                style={{ height: 24, width: 24, borderRadius: 12 }}
                source={{
                  uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                    item.user_id
                  ).toString(36)}.png`,
                }}
              />
            )}
            title={`${item.username}`}
            onPress={() =>
              close({
                user_id: Number(item.user_id),
                username: item.username,
              })
            }
          />
        )}
      />
    </Layout>
  );
}
interface OverrideSearchModalProps {
  close: (data: { tag: string; radius: string } | { icon: string; radius: string }) => void;
}

function OverrideSearchModal({ close }: OverrideSearchModalProps) {
  const { t } = useTranslation();
  const [value, search, onValue] = useSearch(500);
  const db = useDB();
  const [OverrideSearch, Tags] = React.useMemo(() => {
    const Tags = Object.keys(TypeTags)
      .filter(
        i => (i.startsWith("Bouncer") && !i.startsWith("BouncerHost")) || i.startsWith("Scatter")
      )
      .map(i => ({
        i,
        l: i
          .replace(/^Bouncer/, "")
          .replace(/PCS([0-2])/, "PC Season $1")
          .replace("PC", "Pouch Creature")
          .replace("Seasonal", "SeasonalSpecials")
          .replace(/Stage([0-3])/, "Stage $1")
          .replace(/SeasonalSpecials([0-9]+)/, "$1 Seasonal Specials")
          .replace("SeasonalSpecials", "AllSeasonalSpecials")
          .replace(/([A-Za-z])([A-Z0-9])([a-z0-9])/g, "$1 $2$3")
          .replace(/Pouch Creature (.+)/, "$1 Pouch Creatures")
          .replace(/Pouch Creature$/, "Pouch Creatures")
          .replace(/Myth (.+)/, "$1 Myths")
          .replace(/Myth$/, "Myths")
          .replace(/Retired$/, "All Retired")
          .replace(/Flat$/, "Fancy Flats")
          .replace(/Flat Phantom$/, "Phantom Flats")
          .replace(/Scatter$/, "Scatters")
          .replace(/Scatter Standalone$/, "Standalone Scatters")
          .replace(/Nomad$/, "Nomads")
          .replace(/TPOB$/, "tPOBs"),
        t: "tag",
        p: db.types.filter(t => t.has_tag(TypeTags[i as keyof typeof TypeTags])).length,
      }))
      .filter(i => db.types.find(t => t.has_tag(TypeTags[i.i as keyof typeof TypeTags])))
      .filter(i => i.l);

    const Types = db.types
      .filter(i => i.has_tag(TypeTags.Bouncer) || i.has_tag(TypeTags.Scatter))
      .map(i => ({
        i: i.icon,
        l: i.name,
        t: "icon",
        p: 0,
      }));

    return [new fuse([...Tags, ...Types], {
      keys: ["i", "l"],
    }), Tags] as const;
  }, [db]);
  const results = search.length > 0 ? OverrideSearch.search(search).map(i => i.item) : Tags;
  return (
    <Layout level="4" style={{ borderRadius: 8, padding: 4 }}>
      <Input
        style={{ margin: 4 }}
        label={t("settings_notifications:bouncers_override_search")}
        value={value}
        onChangeText={onValue}
        caption={t("settings_notifications:bouncers_override_search_hint")}
      />

      <List
        windowSize={3}
        style={{
          height: 400,
          width: 300,
          margin: 4,
          borderRadius: 8,
          maxWidth: "100%",
          flexShrink: 1,
        }}
        data={results}
        renderItem={({ item, index }) => (
          <ListItem
            accessoryLeft={() =>
              item.t === "icon" ? (
                <TypeImage style={{ size: 24 }} icon={item.i} />
              ) : (
                <TypeImage
                  style={{ size: 24 }}
                  icon={
                    db.types.find(t => t.has_tag(TypeTags[item.i as keyof typeof TypeTags]))
                      ?.icon ?? ""
                  }
                />
              )
            }
            title={`${item.l}`}
            onPress={() => {
              if (item.t === "icon") {
                close({
                  icon: item.i,
                  radius: "0",
                });
              } else {
                close({
                  tag: item.i,
                  radius: "0",
                });
              }
            }}
          />
        )}
      />
    </Layout>
  );
}

export function UpdateWrapper({
  children,
}: {
  children: (update: () => void) => React.ReactElement;
}) {
  const [, update] = React.useReducer(a => a + 1, 0);
  return children(update);
}

export type DeviceNotificationUser = {
  user_id: number;
  username: string;
  primary?: boolean;
  streaksaver?: {
    time: number;
    types: ("deploy" | "capture" | "poi")[];
  };
};

export type DeviceNotificationStaticLocation = {
  enabled: boolean;
  latitude: string;
  longitude: string;
  name: string;
};

export type DeviceNotificationSettings = {
  type: "expo";
  token: string;

  users: DeviceNotificationUser[];

  locations: {
    dynamic?: {
      latitude: number;
      longitude: number;
    };
    static: DeviceNotificationStaticLocation[];
  };

  bouncers: {
    enabled: boolean;
    default: string;
    starred: string;
    overrides: (
      | {
          tag: string;
          radius: string;
        }
      | {
          icon: string;
          radius: string;
        }
    )[];
  };

  starred_users: {
    user_id: number;
    username: string;
  }[];

  munzee_blog: boolean;
  imperial: boolean;

  language?: string;
};

export default function NotificationScreen() {
  const { t } = useTranslation();
  const db = useDB();
  const [Types, Tags] = React.useMemo(() => {
    const Tags = Object.keys(TypeTags)
      .filter(
        i => (i.startsWith("Bouncer") && !i.startsWith("BouncerHost")) || i.startsWith("Scatter")
      )
      .map(i => ({
        i,
        l: i
          .replace(/^Bouncer/, "")
          .replace(/PCS([0-2])/, "PC Season $1")
          .replace("PC", "Pouch Creature")
          .replace("Seasonal", "SeasonalSpecials")
          .replace(/Stage([0-3])/, "Stage $1")
          .replace(/SeasonalSpecials([0-9]+)/, "$1 Seasonal Specials")
          .replace("SeasonalSpecials", "AllSeasonalSpecials")
          .replace(/([A-Za-z])([A-Z0-9])([a-z0-9])/g, "$1 $2$3")
          .replace(/Pouch Creature (.+)/, "$1 Pouch Creatures")
          .replace(/Pouch Creature$/, "Pouch Creatures")
          .replace(/Myth (.+)/, "$1 Myths")
          .replace(/Myth$/, "Myths")
          .replace(/Retired$/, "All Retired")
          .replace(/Flat$/, "Fancy Flats")
          .replace(/Flat Phantom$/, "Phantom Flats")
          .replace(/Scatter$/, "Scatters")
          .replace(/Scatter Standalone$/, "Standalone Scatters")
          .replace(/Nomad$/, "Nomads")
          .replace(/TPOB$/, "tPOBs"),
        t: "tag",
        p: db.types.filter(t => t.has_tag(TypeTags[i as keyof typeof TypeTags])).length,
      }))
      .filter(i => db.types.find(t => t.has_tag(TypeTags[i.i as keyof typeof TypeTags])))
      .filter(i => i.l);

    const Types = db.types
      .filter(i => i.has_tag(TypeTags.Bouncer) || i.has_tag(TypeTags.Scatter))
      .map(i => ({
        i: i.icon,
        l: i.name,
        t: "icon",
        p: 0,
      }));

    return [Types, Tags] as const;
  }, [db]);
  useTitle(`${t("pages:settings")} - ${t("pages:settings_notifications")}`);
  const [settings, setSettings] = React.useState<DeviceNotificationSettings>();
  const [token, setToken] = React.useState<string>();
  const [saved, setSaved] = React.useState(0);
  const [locationPickerIndex, setLocationPickerIndex] = React.useState<number>();
  const [starredUserModal, setStarredUserModal] = React.useState(false);
  const [distanceOverrideModal, setDistanceOverrideModal] = React.useState(false);
  const [confirmLocation, setConfirmLocation] = React.useState(false);
  const [debugStatus, setDebugStatus] = React.useState("");
  const [errors, setErrors] = React.useState<any[]>([]);
  const [, setLiveLocationError] = useSetting(LiveLocationErrorAtom);

  async function registerForPushNotificationsAsync() {
    try {
      if (Constants.isDevice) {
        const gotPerm = await Notifications.getPermissionsAsync();
        const { status: existingStatus } = gotPerm;
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          setDebugStatus(`GotPerm: ${JSON.stringify(gotPerm)}`);
          const requestPerm = await Notifications.requestPermissionsAsync();
          const { status } = requestPerm;
          finalStatus = status;
          setDebugStatus(
            `GotPerm: ${JSON.stringify(gotPerm)}\nRequestPerm: ${JSON.stringify(requestPerm)}`
          );
        }
        if (finalStatus !== "granted") {
          setToken("_failed");
          return;
        }
        const token = await Notifications.getExpoPushTokenAsync({
          experienceId: "@sohcah/PaperZee",
        });
        setDebugStatus(`GotPerm: ${JSON.stringify(gotPerm)}\nToken: ${JSON.stringify(token)}`);
        setToken(token.data);
      } else {
        setToken("_failed");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } catch (e) {
      setDebugStatus(`Error: ${e.toString()}`);
    }
  }

  React.useEffect(() => {
    if (Platform.OS === "web") return;
    if (token && token !== "_failed") {
      (async function () {
        const response = await fetch(`${baseURL}/notifications/get`, {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        setSettings((await response.json()).data);
      })();
    } else if (!token) {
      registerForPushNotificationsAsync();
    }
  }, [token]);

  if (Platform.OS === "web")
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text category="h5">{t("settings_notifications:error_web")}</Text>
      </Layout>
    );
  if (!token)
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Spinner />
      </Layout>
    );
  if (token === "_failed")
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text category="h5">{t("settings_notifications:error_permissions")}</Text>
      </Layout>
    );
  if (!settings)
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Spinner />
      </Layout>
    );

  return (
    <Layout style={{ flex: 1 }}>
      {errors.length > 0 && <Loading customErrors={errors} />}
      <Modal
        backdropStyle={{ backgroundColor: "#00000077" }}
        visible={locationPickerIndex !== undefined}
        onBackdropPress={() => setLocationPickerIndex(undefined)}>
        <LocationPickerModal
          close={() => setLocationPickerIndex(undefined)}
          remove={() => {
            settings.locations.static.splice(locationPickerIndex ?? 0, 1);
            setLocationPickerIndex(undefined);
          }}
          location={settings.locations.static[locationPickerIndex ?? 0]}
        />
      </Modal>
      <Modal
        backdropStyle={{ backgroundColor: "#00000077" }}
        visible={starredUserModal}
        onBackdropPress={() => setStarredUserModal(false)}>
        <UserSearchModal
          close={data => {
            settings.starred_users.push(data);
            setStarredUserModal(false);
          }}
        />
      </Modal>
      <Modal
        backdropStyle={{ backgroundColor: "#00000077" }}
        visible={confirmLocation}
        onBackdropPress={() => setConfirmLocation(false)}>
        <ConfirmLocationModal
          confirm={async () => {
            try {
              await Location.requestBackgroundPermissionsAsync();
              const loc =
                (await Location.getLastKnownPositionAsync()) ??
                (await Location.getCurrentPositionAsync());
              settings.locations.dynamic = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              setConfirmLocation(false);
            } catch (e) {}
          }}
          close={() => {
            setConfirmLocation(false);
          }}
        />
      </Modal>
      <Modal
        backdropStyle={{ backgroundColor: "#00000077" }}
        visible={distanceOverrideModal}
        onBackdropPress={() => setDistanceOverrideModal(false)}>
        <OverrideSearchModal
          close={data => {
            settings.bouncers.overrides.push(data);
            settings.bouncers.overrides.sort((a, b) => {
              const ap = "icon" in a ? 1 : Tags.find(i => i.i === a.tag)?.p;
              const bp = "icon" in b ? 1 : Tags.find(i => i.i === b.tag)?.p;
              return (ap || 0) - (bp || 0);
            });
            setDistanceOverrideModal(false);
          }}
        />
      </Modal>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignSelf: "center",
          width: 1000,
          maxWidth: "100%",
          padding: 4,
          flexDirection: "row",
          flexWrap: "wrap",
        }}>
        <View style={{ width: 400, flexGrow: 1, maxWidth: "100%", padding: 4 }}>
          <Layout level="2" style={{ margin: 4, padding: 4, flex: 1, borderRadius: 8 }}>
            <Text style={{ margin: 4 }} category="h6">
              {t("settings_notifications:bouncers_title")}
            </Text>
            {token.includes("-8Xz") && (
              <>
                <Text>DEBUG: {token}</Text>
                <Text>DEBUGSTATUS: {debugStatus}</Text>
              </>
            )}
            <CheckBox
              style={{ margin: 8 }}
              checked={settings.bouncers.enabled}
              onChange={checked =>
                setSettings({ ...settings, bouncers: { ...settings.bouncers, enabled: checked } })
              }>
              {t("settings_notifications:bouncers_enabled")}
            </CheckBox>
            {settings.bouncers.enabled ? (
              <>
                <UpdateWrapper>
                  {update => (
                    <Input
                      style={{ margin: 4 }}
                      value={settings.bouncers.default}
                      label={t("settings_notifications:bouncers_distance_default", {
                        unit: settings.imperial ? "mi" : "km",
                      })}
                      caption={t("settings_notifications:bouncers_distance_default_hint")}
                      onChangeText={text => {
                        settings.bouncers.default = text;
                        update();
                      }}
                    />
                  )}
                </UpdateWrapper>
                <UpdateWrapper>
                  {update => (
                    <Input
                      style={{ margin: 4 }}
                      value={settings.bouncers.starred}
                      label={t("settings_notifications:bouncers_distance_starred", {
                        unit: settings.imperial ? "mi" : "km",
                      })}
                      onChangeText={text => {
                        settings.bouncers.starred = text;
                        update();
                      }}
                    />
                  )}
                </UpdateWrapper>
                <Text style={{ margin: 4 }} category="s1">
                  {t("settings_notifications:bouncers_override_title")}
                </Text>
                <Text style={{ margin: 4 }} category="p1">
                  {t("settings_notifications:bouncers_override_description")}
                </Text>
                <UpdateWrapper>
                  {bigupdate => (
                    <>
                      {settings.bouncers.overrides.map((i, index) => (
                        <UpdateWrapper>
                          {update => (
                            <Layout level="3" style={{ margin: 4, borderRadius: 8 }}>
                              {"icon" in i ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 4,
                                  }}>
                                  <TypeImage style={{ size: 24, marginRight: 8 }} icon={i.icon} />
                                  <Text style={{ flex: 1 }} category="s1">
                                    {Types.find(t => t.i === i.icon)?.l}
                                  </Text>
                                  <Button
                                    size="small"
                                    appearance="outline"
                                    status="danger"
                                    accessoryLeft={props => <Icon name="close" {...props} />}
                                    onPress={() => {
                                      settings.bouncers.overrides.splice(index, 1);
                                      bigupdate();
                                    }}
                                  />
                                </View>
                              ) : (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 4,
                                  }}>
                                  <TypeImage
                                    style={{ size: 24, marginRight: 8 }}
                                    icon={
                                      db.types.find(t =>
                                        t.has_tag(TypeTags[i.tag as keyof typeof TypeTags])
                                      )?.icon ?? ""
                                    }
                                  />
                                  <Text style={{ flex: 1 }} category="s1">
                                    {Tags.find(t => t.i === i.tag)?.l}
                                  </Text>
                                  <Button
                                    size="small"
                                    appearance="outline"
                                    status="danger"
                                    accessoryLeft={props => <Icon name="close" {...props} />}
                                    onPress={() => {
                                      settings.bouncers.overrides.splice(index, 1);
                                      bigupdate();
                                    }}
                                  />
                                </View>
                              )}
                              <Input
                                style={{ margin: 4 }}
                                value={i.radius}
                                label={t("settings_notifications:bouncers_override_distance", {
                                  unit: settings.imperial ? "mi" : "km",
                                })}
                                onChangeText={text => {
                                  i.radius = text;
                                  update();
                                }}
                              />
                            </Layout>
                          )}
                        </UpdateWrapper>
                      ))}
                      <Button
                        style={{ margin: 4 }}
                        size="small"
                        appearance="outline"
                        accessoryLeft={props => <Icon name="plus" {...props} />}
                        onPress={() => {
                          setDistanceOverrideModal(true);
                        }}>
                        {t("settings_notifications:bouncers_override_add")}
                      </Button>
                    </>
                  )}
                </UpdateWrapper>
              </>
            ) : null}
          </Layout>
        </View>

        <View style={{ width: 400, flexGrow: 1, maxWidth: "100%", padding: 4 }}>
          <Layout level="2" style={{ margin: 4, padding: 4, flex: 1, borderRadius: 8 }}>
            <Text style={{ margin: 4 }} category="h6">
              {t("settings_notifications:starred_users_title")}
            </Text>
            <UpdateWrapper>
              {update => (
                <>
                  {settings.starred_users.map((i, index) => (
                    <Layout
                      level="3"
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 4,
                        margin: 4,
                        borderRadius: 8,
                      }}>
                      <Image
                        style={{ height: 24, width: 24, borderRadius: 12, marginRight: 8 }}
                        source={{
                          uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${i.user_id.toString(
                            36
                          )}.png`,
                        }}
                      />
                      <Text style={{ flex: 1 }} category="s1">
                        {i.username}
                      </Text>
                      <Button
                        size="small"
                        status="danger"
                        appearance="outline"
                        accessoryLeft={props => <Icon name="close" {...props} />}
                        onPress={() => {
                          settings.starred_users.splice(index, 1);
                          update();
                        }}
                      />
                    </Layout>
                  ))}
                  <Button
                    style={{ margin: 4 }}
                    size="small"
                    appearance="outline"
                    accessoryLeft={props => <Icon name="plus" {...props} />}
                    onPress={() => {
                      setStarredUserModal(true);
                    }}>
                    {t("settings_notifications:starred_users_add")}
                  </Button>
                </>
              )}
            </UpdateWrapper>
          </Layout>
        </View>

        {/* Locations */}
        <View style={{ width: 400, flexGrow: 1, maxWidth: "100%", padding: 4 }}>
          <Layout level="2" style={{ margin: 4, padding: 4, flex: 1, borderRadius: 8 }}>
            <Text category="h6">{t("settings_notifications:locations_title")}</Text>
            <UpdateWrapper>
              {update => (
                <Layout
                  level="3"
                  style={{
                    margin: 4,
                    borderRadius: 8,
                    padding: 4,
                    paddingHorizontal: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}>
                  <CheckBox
                    checked={!!settings.locations.dynamic}
                    onChange={async () => {
                      if (settings.locations.dynamic) {
                        settings.locations.dynamic = undefined;
                      } else {
                        setConfirmLocation(true);
                      }
                      update();
                    }}
                  />

                  <View style={{ marginHorizontal: 8, flex: 1 }}>
                    <Text category="s1">
                      <Icon style={{ height: 16, width: 16 }} name="crosshairs-gps" />{" "}
                      {t("settings_notifications:locations_live_title")}
                    </Text>
                    {settings.locations.dynamic ? (
                      <Text category="c1">
                        {settings.locations.dynamic.latitude} {settings.locations.dynamic.longitude}
                      </Text>
                    ) : (
                      <Text category="c1">
                        {t("settings_notifications:locations_live_disabled")}
                      </Text>
                    )}
                  </View>
                </Layout>
              )}
            </UpdateWrapper>
            {settings.locations.static.map((i, index) => (
              <UpdateWrapper>
                {update => (
                  <Layout
                    level="3"
                    style={{
                      margin: 4,
                      borderRadius: 8,
                      padding: 4,
                      paddingHorizontal: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}>
                    <CheckBox
                      checked={i.enabled}
                      onChange={checked => {
                        i.enabled = checked;
                        update();
                      }}
                    />
                    <View style={{ marginHorizontal: 8, flex: 1 }}>
                      <Text category="s1">{i.name}</Text>
                      <Text category="c1">
                        {i.latitude} {i.longitude}
                      </Text>
                    </View>
                    <Button
                      size="small"
                      appearance="outline"
                      accessoryLeft={props => <Icon name="pencil" {...props} />}
                      onPress={() => setLocationPickerIndex(index)}
                    />
                  </Layout>
                )}
              </UpdateWrapper>
            ))}
            <Button
              style={{ margin: 4 }}
              size="small"
              appearance="outline"
              accessoryLeft={props => <Icon name="plus" {...props} />}
              onPress={() => {
                settings.locations.static.push({
                  latitude: "0",
                  longitude: "0",
                  name: "",
                  enabled: true,
                });
                setLocationPickerIndex(settings.locations.static.length - 1);
              }}>
              {t("settings_notifications:locations_static_add")}
            </Button>
          </Layout>
        </View>

        <View style={{ width: 400, flexGrow: 1, maxWidth: "100%", padding: 4 }}>
          <Layout level="2" style={{ margin: 4, padding: 4, flex: 1, borderRadius: 8 }}>
            <Text style={{ margin: 4 }} category="h6">
              {t("settings_notifications:other_title")}
            </Text>
            <CheckBox
              style={{ margin: 8 }}
              checked={settings.munzee_blog}
              onChange={checked => setSettings({ ...settings, munzee_blog: checked })}>
              {t("settings_notifications:other_news_munzee")}
            </CheckBox>
            <CheckBox
              style={{ margin: 8 }}
              checked={settings.imperial}
              onChange={checked => setSettings({ ...settings, imperial: checked })}>
              {t("settings_notifications:other_units_imperial")}
            </CheckBox>

            <Heading fontSize="md">{t("settings_personalisation:language")}</Heading>
            <Select
              style={{ margin: 4 }}
              value={settings.language || "en-GB"}
              onValueChange={value => setSettings({ ...settings, language: value })}
              options={LANGS.map(i => ({
                value: i[0],
                label: i[1],
              }))}
            />
          </Layout>
        </View>
      </ScrollView>
      <View style={{ width: 600, maxWidth: "100%", padding: 4, alignSelf: "center" }}>
        {saved > 0 && (
          <Layout level="3" style={{ margin: 4, borderRadius: 8, padding: 4 }}>
            <Text category="h6">
              <Icon name="check" style={{ height: 24, width: 24 }} /> {t("settings_common:saved")}
            </Text>
          </Layout>
        )}
        {saved === 2 && (
          <Layout level="3" style={{ margin: 4, borderRadius: 8, padding: 4 }}>
            <Text category="h6">
              <Icon name="crosshairs-off" style={{ height: 24, width: 24 }} />{" "}
              {t("settings_notifications:locations_live_title")}{" "}
              {t("settings_notifications:locations_live_disabled")}
            </Text>
            <Text category="s1">{t("settings_notifications:locations_live_blocked")}</Text>
          </Layout>
        )}
        <Button
          style={{ margin: 4 }}
          onPress={async () => {
            try {
              let responseCode = 1;
              if (!settings) return;

              // Setup Dynamic Locations
              if (settings.locations.dynamic) {
                // Ask for Location Permission
                const permissionsResponse = await Location.requestBackgroundPermissionsAsync();
                const { status } = permissionsResponse;
                setDebugStatus(`DATA: ${JSON.stringify(permissionsResponse)}`);

                // Check Permission allowed Always
                if (status === "granted") {
                  await Location.startLocationUpdatesAsync("BACKGROUND_LOCATION", {
                    accuracy: Location.Accuracy.Low,
                    deferredUpdatesDistance: 250,
                    deferredUpdatesTimeout: 900000,
                  });
                } else {
                  // Error
                  settings.locations.dynamic = undefined;
                  responseCode = 2;
                }
              } else {
                try {
                  // Stop Location Updates
                  if ("LiveLocation" in NativeModules)
                    NativeModules.LiveLocation.stopLocationUpdates();
                  await Location.stopLocationUpdatesAsync("BACKGROUND_LOCATION");
                } catch (e) {}
              }

              // Update Settings Server-side
              await fetch(`${baseURL}/notifications/signup`, {
                method: "POST",
                body: JSON.stringify({
                  data: JSON.stringify({
                    ...settings,
                    platform:
                      Platform.OS === "android"
                        ? `android_${
                            Application.nativeApplicationVersion === "2.0.1" ? "2.0.1" : "2.0.2"
                          }`
                        : "ios",
                  }),
                }),
              });
              setLiveLocationError("");
              setSaved(responseCode);
              setTimeout(() => {
                setSaved(0);
              }, 5000);
            } catch (e) {
              setErrors(d => [...d, e]);
            }
          }}
          accessoryLeft={props => <Icon {...props} name="content-save" />}>
          {t("settings_common:save")}
        </Button>
      </View>
    </Layout>
  );
}
