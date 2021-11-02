import { ListItem, Popover } from "@ui-kitten/components";
import React, { PropsWithChildren, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  PixelRatio,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";
import {
  ClanStatsUser,
  ClanStatsData,
  ClanShadowData,
  ClanRequirements,
  ClanRewardsData,
} from "@cuppazee/utils";
import { ClanV2 } from "@cuppazee/api/clan/main";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import useSetting, {
  ClanOptions,
  ClanPersonalisationAtom,
  ClansAtom,
} from "../../hooks/useSetting";
import Icon, { IconName } from "../Common/Icon";
import useDB from "../../hooks/useDB";
import { NavProp } from "../../navigation";
import { Box, Text } from "native-base";
import { UsersSetAtom, useUserSetting } from "../../hooks/useUserSettings";
import { selectAtom, useAtomValue } from "jotai/utils";
import { atom, Atom, useAtom } from "jotai";

const clanAtomCache = new Map<number, Atom<ClanOptions>>();

function getClanAtom(clan_id: number) {
  if (!clanAtomCache.has(clan_id)) {
    const atom = selectAtom(ClansAtom, i => i[clan_id]);
    clanAtomCache.set(clan_id, atom);
  }
  return clanAtomCache.get(clan_id)!;
}

export function useClanOptions(clan_id: number) {
  const clanAtom = getClanAtom(clan_id);
  return (
    useAtomValue(clanAtom) ?? {
      shadow: true,
      level: 5,
      share: false,
      subtract: false,
    }
  );
}

const textColorCache = new Map<string, boolean>();

export function pickTextColor(
  bgColor: string,
  lightColor: string = "#fff",
  darkColor: string = "#000"
) {
  if (!textColorCache.has(bgColor)) {
    const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    const uiColors = [r / 255, g / 255, b / 255];
    const c = uiColors.map(col => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    textColorCache.set(bgColor, L > 0.179);
  }
  return textColorCache.get(bgColor) ? darkColor : lightColor;
}

export const ClanCellStyleAtom = atom<{[key: string]: any}>({});

function generateClanCellStyle(style: {
  style: number;
  reverse: boolean;
  single_line: boolean;
  full_background: boolean;
  colours: string[];
  edited: boolean;
}, type: "title" | "header" | "header_stack" | "data") {
  const fontScale = PixelRatio.getFontScale();

  const isCompact = style.style >= 2;
  const isStack = type === "title" || type === "header_stack";
  const isSingleLine = style.single_line && !isStack;
  const imageSize = (isSingleLine ? 0.75 : 1) * (isCompact ? 24 : 32) * fontScale;
  const iconSize = (isSingleLine ? 16 : 24) * fontScale;
  const iconMargin = (isCompact ? 4 : 8) * fontScale;

  const height =
    {
      title: isCompact ? 69 : 77,
      header_stack: isCompact ? 69 : 77,
      header: isSingleLine ? (isCompact ? 26 : 32) : isCompact ? 34 : 40,
      data: isSingleLine ? (isCompact ? 26 : 32) : isCompact ? 34 : 40,
    }[type] * fontScale;
  return {
    isCompact,
    isStack,
    isSingleLine,
    height,
    imageSize,
    iconSize,
    iconMargin,
    fullBackground: style.full_background,
    colours: style.colours
  };
}

export function ClanCellStyleHandler() {
  const style = useAtomValue(ClanPersonalisationAtom);
  const [_, setClanCellStyle] = useAtom(ClanCellStyleAtom);
  React.useEffect(() => {
    setClanCellStyle({
      title: generateClanCellStyle(style, "title"),
      header: generateClanCellStyle(style, "header"),
      header_stack: generateClanCellStyle(style, "header_stack"),
      data: generateClanCellStyle(style, "data"),
    });
  }, [style]);
  return null;
}


function PressWrapper(props: PropsWithChildren<PressableProps>) {
  if (props.onPress) {
    return <Pressable {...props} />;
  }
  return <>{props.children}</>;
}

export interface CommonCellProps {
  type: "title" | "header" | "header_stack" | "data";
  color?: number;
  image?: ImageSourcePropType;
  icon?: IconName;
  title?: string;
  titleBold?: boolean;
  titleIcon?: IconName;
  subtitle?: string;
  clanStyle?: any;
  onPress?: () => void;
}

const ColorStyleCache: Map<string, any> = new Map();

function colorStyles(color: string) {
  if (!ColorStyleCache.has(color)) {
    const c = color ?? "#cccccc";
    ColorStyleCache.set(
      color,
      StyleSheet.create({
        BackgroundFull: { backgroundColor: c },
        Background: { backgroundColor: c + "22" },
      })
    );
  }
  return ColorStyleCache.get(color);
}

export const CommonCell = function (props: CommonCellProps) {
  // const [styleValue] = useSetting(ClanPersonalisationAtom);
  // const style = props.clanStyle ?? styleValue;

  const {
    isCompact,
    isStack,
    isSingleLine,
    height,
    imageSize,
    iconSize,
    iconMargin,
    fullBackground,
    colours = [],
  } = useAtomValue(ClanCellStyleAtom)[props.type] ?? {};
  //   useMemo(() => {
  //     const isCompact = style.style >= 2;
  //     const isStack = props.type === "title" || props.type === "header_stack";
  //     const isSingleLine = style.single_line && !isStack;
  //     const imageSize = (isSingleLine ? 0.75 : 1) * (isCompact ? 24 : 32) * fontScale;
  //     const iconSize = (isSingleLine ? 16 : 24) * fontScale;
  //     const iconMargin = (isCompact ? 4 : 8) * fontScale;

  //     const height =
  //       {
  //         title: isCompact ? 69 : 77,
  //         header_stack: isCompact ? 69 : 77,
  //         header: isSingleLine ? (isCompact ? 26 : 32) : isCompact ? 34 : 40,
  //         data: isSingleLine ? (isCompact ? 26 : 32) : isCompact ? 34 : 40,
  //       }[props.type] * fontScale;
  //     return { isCompact, isStack, isSingleLine, height, imageSize, iconSize, iconMargin };
  //   }, [style.style, style.single_line, props.type]);

  const wrapperBoxProps = useMemo(() => {
    return {
      bg: isCompact ? undefined : "regularGray.200",
      _dark: {
        bg: isCompact ? undefined : "regularGray.800",
      },
      style: [
        isCompact ? undefined : styles.card,
        {
          height,
          flexDirection: isStack ? "column" : "row",
          alignItems: "center",
          opacity: props.color === -1 && !fullBackground ? 0.4 : 1,
        },
        props.color !== undefined
          ? colorStyles(colours[props.color])[fullBackground ? "BackgroundFull" : "Background"]
          : undefined,
      ],
    };
  }, [isCompact, isStack, props.color, fullBackground, colours]);

  const textColor = useMemo(
    () =>
      props.color !== undefined && fullBackground
        ? { color: pickTextColor(colours[props.color] ?? "#aaaaaa") }
        : undefined,
    [props.color, fullBackground, colours]
  );

  const fontScale = PixelRatio.getFontScale();

  if (!props.onPress && !props.image && !props.icon && (isSingleLine || !props.subtitle)) {
    return (
      <Box {...wrapperBoxProps}>
        <Text
          key="_title"
          style={[
            textColor,
            {
              textAlign: props.subtitle ? "left" : "center",
              marginLeft:
                !!props.subtitle ||
                !(props.color !== undefined && !isStack && !fullBackground)
                  ? 0
                  : -4,
              flex: 1,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight={props.type !== "data" || props.titleBold ? "bold" : undefined}
          fontSize={props.type !== "data" || props.titleBold ? "sm" : "sm"}>
          {props.titleIcon && (
            <Icon
              key="_titleIcon"
              colorBlank
              name={props.titleIcon}
              style={{ height: 12, width: 12 }}
            />
          )}
          {props.title}
        </Text>
      </Box>
    );
  }

  return (
    <PressWrapper onPress={props.onPress}>
      <Box {...wrapperBoxProps}>
        {props.color !== undefined && !isStack && !fullBackground && (
          <View
            key="_left"
            style={{
              width: 4 * fontScale,
              alignSelf: "stretch",
              borderTopLeftRadius: isCompact ? 0 : 8,
              borderBottomLeftRadius: isCompact ? 0 : 8,
              backgroundColor: colours[props.color] ?? "#aaaaaa",
            }}
          />
        )}
        {props.image ? (
          <Image
            key="_image"
            source={props.image}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius:
                typeof props.image === "object" &&
                "uri" in props.image &&
                (props.image.uri?.includes("/avatars/ua") ||
                  props.image.uri?.includes("/clan_logos/"))
                  ? imageSize / 2
                  : 0,
              margin: 4 * fontScale,
            }}
          />
        ) : props.icon ? (
          <Icon
            key="_icon"
            style={[
              {
                width: iconSize,
                height: iconSize,
                marginHorizontal: iconMargin,
                marginVertical: isStack ? iconMargin : 0,
              },
              textColor,
            ]}
            name={props.icon}
          />
        ) : null}
        <View
          key="_text"
          style={{
            paddingHorizontal: 4,
            flex: 1,
            alignItems: isStack ? "center" : "stretch",
            maxWidth: "100%",
          }}>
          {props.title && (
            <Text
              key="_title"
              style={[
                textColor,
                {
                  textAlign: props.subtitle ? "left" : "center",
                  marginLeft:
                    !!props.subtitle ||
                    !(props.color !== undefined && !isStack && !fullBackground)
                      ? 0
                      : -4,
                  flexShrink: 1,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              fontWeight={props.type !== "data" || props.titleBold ? "bold" : undefined}
              fontSize={props.type !== "data" || props.titleBold ? "sm" : "sm"}>
              {props.titleIcon && (
                <Icon
                  key="_titleIcon"
                  colorBlank
                  name={props.titleIcon}
                  style={{ height: 12, width: 12 }}
                />
              )}
              {props.title}
            </Text>
          )}
          {!isSingleLine && props.subtitle && (
            <Text
              key="_subtitle"
              style={textColor}
              numberOfLines={1}
              ellipsizeMode="tail"
              fontSize="sm">
              {props.subtitle}
            </Text>
          )}
        </View>
        {props.color !== undefined && isStack && !fullBackground && (
          <View
            key="_bottom"
            style={{
              height: 4 * fontScale,
              width: 45 * fontScale,
              borderTopLeftRadius: isCompact ? 0 : 8,
              borderBottomLeftRadius: isCompact ? 0 : 8,
              backgroundColor: colours[props.color] ?? "#aaaaaa",
            }}
          />
        )}
      </Box>
    </PressWrapper>
  );
};

export interface DataCellProps {
  user: ClanStatsUser | ClanStatsData | null;
  task_id: number;
  clan_id: number;
  requirements: ClanRequirements;
  goalLevel: number;
}

function LargeDataCell(
  props: DataCellProps & { data: { text: string; level: number | undefined } }
) {
  const users = useUserSetting("users");
  const style = useAtomValue(ClanPersonalisationAtom);
  const { t } = useTranslation();
  const db = useDB();
  const text = props.data.text;
  const level = props.data.level;

  return useMemo(
    () => (
      <CommonCell
        type="data"
        color={level}
        icon={!props.user || "username" in props.user ? undefined : "shield-half-full"}
        image={
          !props.user || "username" in props.user
            ? {
                uri:
                  props.user && "username" in props.user
                    ? `https://munzee.global.ssl.fastly.net/images/avatars/ua${props.user.user_id.toString(
                        36
                      )}.png`
                    : `https://server.cuppazee.app/requirements/${props.task_id}.png`,
              }
            : undefined
        }
        title={
          style.reverse
            ? `${db.getClanRequirement(props.task_id).top} ${
                db.getClanRequirement(props.task_id).bottom
              }`
            : props.user && "username" in props.user
            ? props.user.username ?? ""
            : t("clan:group_total")
        }
        titleBold={users?.some(i =>
          props.user && "user_id" in props.user
            ? i.user_id.toString() === props.user?.user_id.toString()
            : false
        )}
        subtitle={text}
      />
    ),
    [level, text, users, props.user, style, props.task_id, db]
  );
}

export function DataCell(props: DataCellProps) {
  const users = useAtomValue(UsersSetAtom);
  const { subtract } = useClanOptions(props.clan_id);
  const style = useAtomValue(ClanPersonalisationAtom);
  const value = props.user?.requirements[props.task_id] ?? {};
  let text: string = "-";
  let level: number | undefined = 0;
  if (
    value?.value === undefined ||
    value?.value === null ||
    Number.isNaN(value?.value) ||
    !props.user
  ) {
    text = "🚫";
    level = -1;
  } else if (subtract) {
    text = Math.max(
      0,
      (props.requirements.tasks["username" in props.user ? "individual" : "group"][props.task_id]?.[
        props.goalLevel
      ] ?? 0) - value.value
    ).toLocaleString();
    level = (value.level ?? 0) >= props.goalLevel ? props.goalLevel : value?.level === -1 ? -1 : 0;
  } else {
    text = value.value.toLocaleString();
    level = value.level;
  }

  if (style.style === 0) {
    return <LargeDataCell {...props} data={{ text, level }} />;
  }
  return useMemo(
    () => (
      <CommonCell
        type="data"
        color={level}
        title={text}
        titleBold={users.has((props.user as any)?.user_id ?? 0)}
      />
    ),
    [level, text, props.user, users]
  );
}

export interface RequirementDataCellProps {
  requirements?: ClanRequirements;
  level: number;
  task: number;
  type: "individual" | "group" | "share";
  members?: number;
}

export function RequirementDataCell(props: RequirementDataCellProps) {
  const [style] = useSetting(ClanPersonalisationAtom);
  const { t } = useTranslation();
  const db = useDB();

  const count =
    props.type === "share"
      ? Math.ceil(
          Math.max(
            props.requirements?.tasks.individual[props.task]?.[props.level] ?? 0,
            (props.requirements?.tasks.group[props.task]?.[props.level] ?? 0) / (props.members ?? 1)
          )
        )
      : props.requirements?.tasks[props.type][props.task]?.[props.level];

  if (style.style === 0) {
    return (
      <CommonCell
        type="data"
        color={props.level}
        icon={
          style.reverse
            ? undefined
            : props.type === "individual"
            ? "account-check"
            : props.type === "share"
            ? "percent"
            : "shield-check"
        }
        image={
          style.reverse
            ? {
                uri: `https://server.cuppazee.app/requirements/${props.task}.png`,
              }
            : undefined
        }
        title={
          style.reverse
            ? `${db.getClanRequirement(props.task).top} ${db.getClanRequirement(props.task).bottom}`
            : t(`clan:${props.type}_level` as const, { level: props.level })
        }
        subtitle={count?.toString() ?? "-"}
      />
    );
  }

  return <CommonCell type="data" color={props.level} title={count?.toString() ?? "-"} />;
}

export type UserCellProps = {
  user: ClanStatsUser | ClanStatsData;
  stack?: boolean;
};

export function UserCell(props: UserCellProps) {
  const nav = useNavigation<NavProp>();
  const { t } = useTranslation();
  return (
    <CommonCell
      onPress={
        "user_id" in props.user
          ? () =>
              nav.navigate("Player_Profile", {
                username: "user_id" in props.user ? props.user.username ?? "" : "",
              })
          : undefined
      }
      type={props.stack ? "header_stack" : "header"}
      color={props.user.level}
      image={
        "user_id" in props.user
          ? {
              uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${props.user.user_id.toString(
                36
              )}.png`,
            }
          : undefined
      }
      icon={"user_id" in props.user ? undefined : "shield-half-full"}
      titleIcon={
        "user_id" in props.user
          ? props.user.shadow
            ? "coffee"
            : props.user.admin
            ? "hammer"
            : undefined
          : undefined
      }
      title={"user_id" in props.user ? props.user.username ?? "" : "Clan Total"}
      subtitle={t("clan:level", { level: props.user.level })}
    />
  );
}

export type LevelCellProps = {
  level: number;
  type: "individual" | "group" | "share";
  stack?: boolean;
  clan_id: number;
  levels: number[];
};

export function ClanLevelCell(props: LevelCellProps) {
  const { t } = useTranslation();
  const [style] = useSetting(ClanPersonalisationAtom);
  const [options, setOptions] = useSetting(ClansAtom);
  const [open, setOpen] = useState(false);

  return (
    <Popover
      fullWidth
      visible={open}
      onBackdropPress={() => setOpen(false)}
      anchor={() => (
        <View>
          <CommonCell
            onPress={() => setOpen(i => !i)}
            type={props.stack ? "header_stack" : "header"}
            color={props.level}
            icon={props.type === "individual" ? "account-check" : "shield-check"}
            title={t(
              style.single_line && !props.stack
                ? props.type === "individual"
                  ? "clan:individual_level"
                  : props.type === "share"
                  ? "clan:share_level"
                  : "clan:group_level"
                : "clan:level",
              { level: props.level }
            )}
            subtitle={t(`clan:${props.type}` as const)}
          />
        </View>
      )}>
      <Box>
        {open &&
          props.levels.map(i => (
            <ListItem
              title={t("clan:level", { level: i }).toString()}
              onPress={() => {
                setOptions({
                  ...options,
                  [props.clan_id || 0]: {
                    ...options[props.clan_id || 0],
                    level: i,
                  },
                });
              }}
            />
          ))}
      </Box>
    </Popover>
  );
}

export function LevelCell(props: LevelCellProps) {
  const { t } = useTranslation();
  const [style] = useSetting(ClanPersonalisationAtom);
  if (!props.clan_id) {
    return (
      <CommonCell
        type={props.stack ? "header_stack" : "header"}
        color={props.level}
        icon={props.type === "individual" ? "account-check" : "shield-check"}
        title={t(
          style.single_line && !props.stack
            ? props.type === "individual"
              ? "clan:individual_level"
              : props.type === "share"
              ? "clan:share_level"
              : "clan:group_level"
            : "clan:level",
          { level: props.level }
        )}
        subtitle={t(`clan:${props.type}` as const)}
      />
    );
  }
  return <ClanLevelCell {...props} />;
}

export type TitleCellProps = {
  clan?: ClanV2["response"];
  shadow?: { data?: ClanShadowData };
};

export function TitleCell(props: TitleCellProps) {
  const { t } = useTranslation();
  return (
    <CommonCell
      type="title"
      image={{
        uri: `https://munzee.global.ssl.fastly.net/images/clan_logos/${props.clan?.data?.details.clan_id.toString(
          36
        )}.png`,
      }}
      title={props.clan?.data?.details.name ?? t("clan:loading")}
      subtitle={`#${props.clan?.data?.result.rank}`}
    />
  );
}

export type RequirementTitleCellProps = {
  game_id: number;
  date: Dayjs;
};

export function RequirementTitleCell(props: RequirementTitleCellProps) {
  const { t } = useTranslation();
  return (
    <CommonCell
      type="title"
      icon="playlist-check"
      title={t("clan:requirements")}
      subtitle={props.date.format("MMM YYYY")}
    />
  );
}

export type RewardTitleCellProps = {
  game_id: number;
  date: Dayjs;
};

export function RewardTitleCell(props: RewardTitleCellProps) {
  const { t } = useTranslation();
  return (
    <CommonCell
      type="title"
      icon="gift"
      title={t("clan:rewards")}
      subtitle={props.date.format("MMM YYYY")}
    />
  );
}

export type RequirementCellProps = {
  task_id: number;
  stack?: boolean;
  requirements: ClanRequirements;
  onPress?: () => void;
  sortBy?: number;
};

export function RequirementCell(props: RequirementCellProps) {
  const { reverse } = useAtomValue(ClanPersonalisationAtom);
  const g = props.requirements.group.includes(props.task_id);
  const i = props.requirements.individual.includes(props.task_id);
  const db = useDB();
  return (
    <CommonCell
      onPress={props.onPress}
      type={props.stack ? "header_stack" : "header"}
      color={g ? (i ? 12 : 13) : 11}
      image={{ uri: `https://server.cuppazee.app/requirements/${props.task_id}.png` }}
      title={db.getClanRequirement(props.task_id).top}
      titleIcon={
        props.sortBy && Math.abs(props.sortBy) === props.task_id
          ? props.sortBy > 0
            ? (`chevron-${reverse ? "right" : "down"}` as const)
            : (`chevron-${reverse ? "left" : "up"}` as const)
          : undefined
      }
      subtitle={db.getClanRequirement(props.task_id).bottom}
    />
  );
}

export interface RewardDataCellProps {
  rewards: ClanRewardsData;
  level: number;
  reward_id: number;
  type: "individual" | "group";
  cumulative: boolean;
}

export function RewardDataCell(props: RewardDataCellProps) {
  const [style] = useSetting(ClanPersonalisationAtom);
  const { t } = useTranslation();

  const count = props.rewards?.levels
    .slice(props.cumulative ? 0 : props.level - 1, props.level)
    .reduce((a, b) => a + (b[props.reward_id] ?? 0), 0);

  if (style.style === 0) {
    return (
      <CommonCell
        type="data"
        color={props.level}
        icon={
          style.reverse ? undefined : props.type === "individual" ? "account-check" : "shield-check"
        }
        image={
          style.reverse
            ? {
                uri: props.rewards.rewards[props.reward_id]?.logo,
              }
            : undefined
        }
        title={
          style.reverse
            ? props.rewards.rewards[props.reward_id]?.name
            : t(`clan:${props.type}_level` as const, { level: props.level })
        }
        subtitle={count === 0 ? "-" : count.toLocaleString()}
      />
    );
  }

  return (
    <CommonCell
      type="data"
      color={props.level}
      title={count === 0 ? "-" : count.toLocaleString()}
    />
  );
}

export type RewardCellProps = {
  reward_id: number;
  stack?: boolean;
  rewards: ClanRewardsData;
};

export function RewardCell(props: RewardCellProps) {
  const [style] = useSetting(ClanPersonalisationAtom);
  if (style.single_line) {
    return (
      <CommonCell
        type={props.stack ? "header_stack" : "header"}
        image={{ uri: props.rewards.rewards[props.reward_id]?.logo }}
        title={props.rewards.rewards[props.reward_id]?.name}
      />
    );
  }
  const title = (props.rewards.rewards[props.reward_id]?.name || "").split(" ");
  let ts = [title.slice(0, -1).join(" "), title[title.length - 1]];
  if (title.length === 1) {
    ts = [title.join(" ")];
  } else if (title[1] === "Hammer") {
    ts = ["Hammer"];
  } else if (title[1] === "Axe") {
    ts = ["Battle Axe"];
  } else if (title.includes("Virtual") && title.includes("Color")) {
    ts = [title.filter(i => i !== "Virtual").join(" "), "Credit"];
  } else if (title.includes("Virtual")) {
    ts = [title.filter(i => i !== "Virtual").join(" "), "Virtual"];
  } else if (title.includes("Flat")) {
    ts = [title.filter(i => i !== "Flat").join(" "), "Flat"];
  }
  return (
    <CommonCell
      type={props.stack ? "header_stack" : "header"}
      image={{ uri: props.rewards.rewards[props.reward_id]?.logo }}
      title={ts[0]}
      subtitle={ts[1]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 4,
    borderRadius: 8,
  },
});
