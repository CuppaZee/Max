import React from "react";
import TypeImage from "./TypeImage";
import { View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import useSetting, { TipsAtom } from "../../hooks/useSetting";
import Icon from "./Icon";
import { Box, Button, Heading, Text } from "native-base";

const babyAnimals: [string, string][] = [
  ["babyhippo", "Baby Hippo"],
  ["babyalpaca", "Baby Alpaca"],
  ["babyreindeer", "Baby Reindeer"],
  ["babyfox", "Baby Fox"],
  ["babymoose", "Baby Moose"],
  ["babysquirrel", "Baby Squirrel"],
  ["babynarwhal", "Baby Narwhal"],
  ["babypenguin", "Baby Penguin"],
  ["babycrab", "Baby Crab"],
  ["babyshark", "Baby Shark"],
  ["babyfawn", "Baby Fawn"],
  ["babytiger", "Baby Tiger"],
  ["babylamb", "Baby Lamb"],
  ["babychick", "Baby Chick"],
  ["babybunny", "Baby Bunny"],
];

export interface TipProps {
  id: string;
  tip: string;
  small?: boolean;
  wrapperStyle?: ViewStyle;
}

export default function Tip({ id, tip, wrapperStyle, small }: TipProps) {
  const { t } = useTranslation();
  const animal = React.useMemo(
    () => babyAnimals[Math.floor(Math.random() * babyAnimals.length)],
    []
  );
  const [tipsViewed, setTipsViewed] = useSetting(TipsAtom);

  if (
    tipsViewed[id]?.count >= 2 ||
    tipsViewed[id]?.time > Date.now() - 432000000
  )
    return null;
  return (
    <View style={wrapperStyle}>
      <Box
        bg="regularGray.300"
        _dark={{ bg: "regularGray.700" }}
        style={{
          borderRadius: 8,
          padding: 4,
          flexDirection: "row",
          alignItems: "center",
        }}>
        <TypeImage style={{ size: small ? 32 : 48, marginRight: 8 }} icon={animal[0]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Heading style={{ flex: 1 }} fontSize="md">
              {t("tips:title")}
            </Heading>
            <Button
              variant="ghost"
              style={{ height: 24, width: 24 }}
              startIcon={<Icon name="close" style={{ height: 24, width: 24 }} />}
              size="xs"
              onPress={() =>
                setTipsViewed({
                  ...tipsViewed,
                  [id]: {
                    count: (tipsViewed[id]?.count ?? 0) + 1,
                    time: Date.now(),
                  },
                })
              }
            />
          </View>
          <Text fontSize="sm">{t(`tips:${id}` as any)}</Text>
        </View>
      </Box>
    </View>
  );
}
