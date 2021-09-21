import { useTheme } from "@ui-kitten/components";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, Popover, Pressable, Text } from "native-base";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, View } from "react-native";
import Icon from "../../components/Common/Icon";
import useDB from "../../hooks/useDB";
import useTitle from "../../hooks/useTitle";

const egyptianTimes: [number, string][] = ([
  [101, "nile"],
  [108, "amon-ra"],
  [122, "mut"],
  [201, "amon-ra"],
  [212, "geb"],
  [301, "osiris"],
  [311, "isis"],
  [401, "thoth"],
  [420, "horus"],
  [508, "anubis"],
  [528, "seth"],
  [619, "nile"],
  [629, "anubis"],
  [714, "bastet"],
  [729, "skehmet"],
  [812, "horus"],
  [820, "geb"],
  [901, "nile"],
  [908, "mut"],
  [923, "bastet"],
  [928, "seth"],
  [1003, "bastet"],
  [1018, "isis"],
  [1030, "skehmet"],
  [1108, "thoth"],
  [1118, "nile"],
  [1127, "osiris"],
  [1219, "isis"],
] as [number, string][]).reverse();

const westernTimes: [number, string][] = ([
  [101, "capricorn"],
  [120, "aquarius"],
  [219, "pisces"],
  [321, "aries"],
  [420, "taurus"],
  [521, "gemini"],
  [621, "cancer"],
  [723, "leo"],
  [823, "virgo"],
  [923, "libra"],
  [1023, "scorpio"],
  [1122, "sagittarius"],
  [1222, "capricorn"],
] as [number, string][]).reverse();

type CalendarData = {
  date: Dayjs;
  western: string;
  egyptian: string;
  qrewzee: boolean;
};

function useDate(date: Dayjs): CalendarData {
  const dm = (date.month() + 1) * 100 + date.date();
  const western = westernTimes.find(i => i[0] <= dm)?.[1] || "zodiac";
  const egyptian = egyptianTimes.find(i => i[0] <= dm)?.[1] || "egyptianzodiacsun";
  const db = useDB();
  return {
    date,
    western,
    egyptian: db.getType(egyptian)
      ? egyptian
      : "egyptianzodiacsun",
    qrewzee: date.date() % 3 === 0,
  };
}

function CalendarCell({ date }: { date: Dayjs }) {
  const { t } = useTranslation();
  const data = useDate(date);
  const theme = useTheme();
  return (
    <View style={{ width: 52, padding: 2, flexGrow: 1 }}>
      <Popover
        trigger={triggerProps => (
          <Pressable {...triggerProps}>
            <Box
              bg="regularGray.300"
              _dark={{ bg: "regularGray.800" }}
              style={{
                borderRadius: 8,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <View
                style={{
                  height: 24,
                  width: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{date.date()}</Text>
              </View>
              <View>
                <Image
                  source={{
                    uri: "https://munzee.global.ssl.fastly.net/images/pins/qrewzee.png",
                  }}
                  style={{
                    height: 28,
                    marginHorizontal: -2,
                    width: 28,
                    opacity: data.qrewzee ? 1 : 0.1,
                  }}
                />
                {!data.qrewzee && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                    <Text>
                      <Icon
                        name="close"
                        style={{
                          height: 24,
                          width: 24,
                          color: theme.style === "dark" ? "#ff7777" : "#ff0000",
                        }}
                      />
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Image
                  source={{
                    uri: `https://munzee.global.ssl.fastly.net/images/pins/${data.egyptian}.png`,
                  }}
                  style={{
                    height: 28,
                    marginHorizontal: -2,
                    width: 28,
                    opacity: data.egyptian === "egyptianzodiacsun" ? 0.1 : 1,
                  }}
                />
                {data.egyptian === "egyptianzodiacsun" && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                    <Text>
                      <Icon name="lock-question" style={{ height: 16, width: 16 }} />
                    </Text>
                  </View>
                )}
              </View>
              <Image
                source={{
                  uri: `https://munzee.global.ssl.fastly.net/images/pins/${data.western}.png`,
                }}
                style={{ height: 28, width: 28, marginHorizontal: -2 }}
              />
            </Box>
          </Pressable>
        )}>
        <Popover.Content
          bg="regularGray.300"
          _dark={{ bg: "regularGray.700" }}
          style={{ borderRadius: 8, padding: 4, alignItems: "center" }}>
          <Text fontSize="md">{date.format("D MMMM")}</Text>
          <Text fontSize="sm">
            {data.qrewzee ? t("calendar:qrewzees_on") : t("calendar:qrewzees_off")}
          </Text>
          <Text fontSize="sm">
            {t("calendar:egyptian_status", { type: data.egyptian.toUpperCase() })}
          </Text>
          <Text fontSize="sm">
            {t("calendar:western_status", { type: data.western.toUpperCase() })}
          </Text>
        </Popover.Content>
      </Popover>
    </View>
  );
}

function DayCell({ day }: { day: number }) {
  const { t } = useTranslation();
  const chinese = [
    ["monkey"], // Sunday
    ["goat"], // Monday
    ["dragon", "pig"], // Tuesday
    ["horse", "rooster"], // Wednesday
    ["rat"], // Thursday
    ["dog", "rabbit", "snake"], // Friday
    ["ox", "tiger"], // Saturday
  ][day];
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ width: 52, padding: 2, flexGrow: 1 }}>
      <Popover
        trigger={triggerProps => (
          <Pressable {...triggerProps}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              style={{
                borderRadius: 8,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <View
                style={{
                  height: 32,
                  width: 64,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {dayjs.weekdaysShort()[day]}
                </Text>
              </View>
              {chinese.map(i => (
                <Image
                  source={{
                    uri: `https://munzee.global.ssl.fastly.net/images/pins/${i}chinesezodiac.png`,
                  }}
                  style={{ height: 28, width: 28, marginHorizontal: -4 }}
                />
              ))}
            </Box>
          </Pressable>
        )}>
        <Popover.Content
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{
            borderRadius: 8,
            padding: 4,
            alignItems: "center",
          }}>
          <Text fontSize="md">{dayjs.weekdays()[day]}</Text>
          <Text fontSize="sm">
            {t("calendar:chinese_status", { types: chinese.join(", ").toUpperCase() })}
          </Text>
        </Popover.Content>
      </Popover>
    </View>
  );
}

export default function CalendarScreen() {
  const { t } = useTranslation();
  useTitle(`${t("pages:tools_calendar")}`);
  const [month, setMonth] = React.useState(dayjs().format());
  const monthStart = dayjs(month).set("date", 1);
  const monthEnd = dayjs(month).set("date", 1).add(1, "month").subtract(1, "day");
  const offset = -dayjs().localeData().firstDayOfWeek() + 7;
  const array = [];
  for (let date = monthStart; date.valueOf() <= monthEnd.valueOf(); date = date.add(1, "day")) {
    array.push(date);
  }
  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View
          style={{
            width: 490,
            maxWidth: "100%",
            alignSelf: "center",
            padding: 4,
          }}>
          <Box
            bg="regularGray.200"
            _dark={{ bg: "regularGray.800" }}
            style={{
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}>
            <Button
              variant="ghost"
              startIcon={<Icon style={{ height: 24, width: 24 }} name="chevron-left" />}
              onPress={() => {
                setMonth(dayjs(month).subtract(1, "month").format());
              }}
            />
            <Text fontSize="xl" style={{ textAlign: "center", flex: 1 }}>
              {dayjs(month).format("MMMM YYYY")}
            </Text>
            <Button
              variant="ghost"
              startIcon={<Icon style={{ height: 24, width: 24 }} name="chevron-right" />}
              onPress={() => {
                setMonth(dayjs(month).add(1, "month").format());
              }}
            />
          </Box>
        </View>
        <ScrollView
          style={{ width: 380, maxWidth: "100%", alignSelf: "center", flexGrow: 0 }}
          horizontal={true}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            minWidth: 364,
            width: 380,
            maxWidth: "100%",
            alignSelf: "center",
          }}>
          {new Array(7)
            .fill(0)
            .map((_, i) => (i + dayjs().localeData().firstDayOfWeek()) % 7)
            .map(i => (
              <DayCell day={i} />
            ))}
          {new Array((monthStart.day() + offset) % 7).fill(1).map(_ => (
            <View style={{ width: 52, flexGrow: 1 }} />
          ))}
          {array.map(i => (
            <CalendarCell date={i} />
          ))}
          {new Array((6 + 7 - monthEnd.day() - offset) % 7).fill(1).map(_ => (
            <View style={{ width: 52, flexGrow: 1 }} />
          ))}
        </ScrollView>
      </ScrollView>
    </Box>
  );
}
