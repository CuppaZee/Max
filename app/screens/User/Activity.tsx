import { RouteProp, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import * as React from "react";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useComponentSize from "../../hooks/useComponentSize";
import UserActivityList from "../../components/Activity/List";
import UserActivityFilter from "../../components/Activity/Filter";
import useTitle from "../../hooks/useTitle";
import useActivity from "../../hooks/useActivity";
import Loading from "../../components/Loading";
import { useTranslation } from "react-i18next";
import useModalSafeArea from "../../hooks/useModalSafeArea";
import { generateUserActivityData, UserActivityFilters } from "@cuppazee/utils";
import useDB from "../../hooks/useDB";
import { Box, Modal } from "native-base";
import { RootStackParamList } from "../../types";

export default function PlayerActivityScreen() {
  const { t } = useTranslation();
  const [size, onLayout] = useComponentSize();
  const [visible, setVisible] = React.useState(false);
  const [filters, setFilters] = React.useState<UserActivityFilters>({
    activity: new Set(),
    category: new Set(),
    state: new Set(),
  });
  const route = useRoute<RouteProp<RootStackParamList, "Player_Activity">>();
  useTitle(
    `${route.params.username} - ${dayjs(
      route.params?.date ?? dayjs.mhqNow()
    ).format("L")}`
  );
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const db = useDB();
  const data = useActivity(user.data?.data?.user_id, route.params?.date);
  const d = React.useMemo(
    () =>
      data.data?.data
        ? generateUserActivityData(db, data.data?.data, filters, user.data?.data?.username)
        : null,
    [data.dataUpdatedAt, filters]
  );
  const modalSafeArea = useModalSafeArea();

  if (!user.isFetched || !data.isFetched || !d || !size) {
    return (
      <Box bg="regularGray.100" _dark={{bg: "regularGray.900" }} style={{ flex: 1 }} onLayout={onLayout}>
        <Loading data={[user, data]} />
      </Box>
    );
  }
  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      onLayout={onLayout}
      style={{ flex: 1, flexDirection: "row" }}>
      <UserActivityList
        toggleFilterModal={(size?.width || 0) > 720 ? undefined : () => setVisible(!visible)}
        d={d}
        user_id={user.data?.data?.user_id ?? 0}
      />
      {(size?.width || 0) > 720 ? (
        <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} style={{ width: 300 }}>
          <UserActivityFilter d={d} filters={filters} setFilters={setFilters} />
        </Box>
      ) : (
        <Modal
          isOpen={visible}
          // backdropStyle={{ backgroundColor: "#0007" }}
          onClose={() => setVisible(false)}>
          <Box
            bg="regularGray.200"
            _dark={{ bg: "regularGray.800" }}
            style={[modalSafeArea, { width: 300, borderRadius: 8 }]}>
            <UserActivityFilter
              d={d}
              filters={filters}
              setFilters={value => {
                setFilters(value);
                setVisible(false);
              }}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
}
