import { Modal, useTheme } from "@ui-kitten/components";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";
import ReactMapGL, {
  Source as GLSource,
  Layer as GLLayer,
  Marker as GLMarker,
  ScaleControl,
  NavigationControl,
  MapContext,
  FlyToInterpolator,
  WebMercatorViewport,
} from "react-map-gl";
import { View } from "react-native";
import useSetting, { MapStyleAtom } from "../../hooks/useSetting";
import Icon from "../Common/Icon";
import Select from "../Common/Select";
import useDB from "../../hooks/useDB";
import {
  AutoMapProps,
  LayerProps,
  MapProps,
  MapViewport,
  SourceProps,
  IconsProps,
  MarkerProps,
  LocationPickerMapProps,
} from "./MapTypes";
import * as Location from "expo-location";
import { MapSearchModal } from "./MapShared";
import circle from "@turf/circle";
import { Box, Button, Row } from "native-base";

export function LocationPickerMap({ icon, onPositionChange, circleColor, circleRadius }: LocationPickerMapProps) {
  const [viewport, setViewport] = React.useState<MapViewport>();
  return (
    <AutoMap
      onPositionChange={viewport => {
        setViewport(viewport);
        onPositionChange?.(viewport);
      }}>
      <Icons icons={[icon]} />
      {viewport && (
        <Source
          id="locationPicker"
          type="geojson"
          data={{
            type: "Feature",
            geometry: { type: "Point", coordinates: [viewport.longitude, viewport.latitude] },
            properties: {},
          }}>
          <Layer
            id="locationPickerPin"
            type="symbol"
            paint={{}}
            layout={{
              "icon-allow-overlap": true,
              "icon-anchor": "bottom",
              "icon-size": 0.8,
              "icon-image": icon,
            }}
          />
        </Source>
      )}

      {!!viewport && !!circleRadius && !!circleColor && (
        <Source
          id="radius"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [
              circle([viewport.longitude, viewport.latitude], circleRadius, {
                units: "meters",
                properties: { colour: circleColor },
              }),
            ],
          }}>
          <Layer
            id="radiusFill"
            type="fill"
            paint={{
              "fill-color": ["get", "colour"],
              "fill-opacity": 0.1,
            }}
          />
          <Layer
            id="radiusStroke"
            type="line"
            paint={{
              "line-color": ["get", "colour"],
            }}
          />
        </Source>
      )}
    </AutoMap>
  );
}

export function AutoMap({
  children,
  onPress,
  controls,
  onSearchSelect,
  onPositionChange,
  onPositionFinishChange,
  defaultViewport,
}: AutoMapProps) {
  const [viewport, setViewport] = React.useState(
    defaultViewport ?? {
      latitude: 0,
      longitude: 0,
      zoom: 0,
    }
  );
  const [mapStyle, setMapStyle] = useSetting(MapStyleAtom);
  const [searchModal, setSearchModal] = React.useState(false);
  const timeout = React.useRef<any>();
  const theme = useTheme();
  const styleURL =
    mapStyle === "monochrome"
      ? theme.mapboxURL
      : mapStyle === "streets"
      ? "mapbox://styles/mapbox/streets-v11"
      : "mapbox://styles/mapbox/satellite-streets-v9";
  return (
    <View style={{ flex: 1 }}>
      <Map
        key={styleURL}
        styleURL={styleURL}
        viewport={viewport}
        setViewport={viewport => {
          setViewport(viewport);
          onPositionChange?.(viewport);
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = setTimeout(() => {
            onPositionFinishChange?.(viewport);
          }, 500);
        }}
        children={children}
        onPress={onPress}
      />
      <Modal
        backdropStyle={{ backgroundColor: "#00000077" }}
        visible={searchModal}
        onBackdropPress={() => setSearchModal(false)}>
        <MapSearchModal
          select={data => {
            let newViewport;
            if (data.bbox) {
              const { longitude, latitude, zoom } = new WebMercatorViewport(
                viewport as any
              ).fitBounds(
                [
                  [Math.min(data.bbox[0], data.bbox[2]), Math.min(data.bbox[1], data.bbox[3])],
                  [Math.max(data.bbox[0], data.bbox[2]), Math.max(data.bbox[1], data.bbox[3])],
                ],
                {
                  padding: 0,
                }
              );
              newViewport = {
                ...viewport,
                longitude,
                latitude,
                zoom,
                transitionDuration: 500,
                transitionInterpolator: new FlyToInterpolator(),
              } as any;
              setViewport(newViewport);
            } else {
              newViewport = {
                ...viewport,
                longitude: data.longitude,
                latitude: data.latitude,
                zoom: 16,
                transitionDuration: 500,
                transitionInterpolator: new FlyToInterpolator(),
              } as any;
              setViewport(newViewport);
            }
            onSearchSelect?.(newViewport);
            setSearchModal(false);
          }}
        />
      </Modal>
      <Box
        bg="regularGray.200"
        _dark={{ bg: "regularGray.800" }}
        w={200}
        style={{ position: "absolute", top: 0, right: 0, padding: 4, borderBottomLeftRadius: 8 }}>
        <Row p={1} space={1}>
          <Button
            flex={1}
            size="xs"
            startIcon={
              <Icon colorBlank style={{ marginHorizontal: 2, height: 24 }} name="magnify" />
            }
            onPress={() => setSearchModal(true)}>
            Search
          </Button>
          <Button
            size="xs"
            startIcon={
              <Icon colorBlank style={{ marginHorizontal: 2, height: 24 }} name="crosshairs-gps" />
            }
            onPress={async () => {
              var { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== "granted") {
                return;
              }
              try {
                var loc = await Location.getCurrentPositionAsync({});
                setViewport({
                  ...viewport,
                  longitude: loc.coords.longitude,
                  latitude: loc.coords.latitude,
                  zoom: 14,
                  transitionDuration: 500,
                  transitionInterpolator: new FlyToInterpolator(),
                } as any);
              } catch (e) {}
            }}
          />
        </Row>
        <Select
          m={1}
          p={1}
          px={2}
          value={
            mapStyle === "monochrome" && theme.mapboxURL === "mapbox://styles/mapbox/streets-v11"
              ? "streets"
              : mapStyle
          }
          onValueChange={(value: any) => setMapStyle(value)}
          options={[
            theme.mapboxURL === "mapbox://styles/mapbox/streets-v11"
              ? (null as any)
              : { value: "monochrome", label: "Themed" },
            { value: "streets", label: "Classic" },
            { value: "satellite", label: "Satellite" },
          ].filter(i => i)}
        />
        {controls}
      </Box>
    </View>
  );
}

export function Map({ viewport, setViewport, children, onPress, styleURL }: MapProps) {
  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken="pk.eyJ1Ijoic29oY2FoIiwiYSI6ImNqeWVqcm8wdTAxc2MzaXFpa282Yzd2aHEifQ.afYbt2sVMZ-kbwdx5_PekQ"
      mapStyle={styleURL}
      mapboxgl={mapboxgl}
      width="100%"
      height="100%"
      onClick={onPress}
      scrollZoom={{
        speed: 0.1,
        smooth: true,
      }}
      onViewportChange={(viewport: MapViewport) => setViewport(viewport)}>
      <ScaleControl maxWidth={100} unit="metric" style={{ right: 8, bottom: 28 }} />
      <NavigationControl style={{ left: 8, top: 8 }} />
      {children}
    </ReactMapGL>
  );
}

export function Source({ children, ...rest }: SourceProps) {
  return <GLSource {...rest}>{children}</GLSource>;
}

export function Layer(props: LayerProps) {
  return <GLLayer {...props} />;
}

export function Icons(props: IconsProps) {
  const db = useDB();
  const context = React.useContext(MapContext);
  React.useEffect(() => {
    for (const icon of props.icons) {
      if (!context.map.hasImage(db.strip(icon))) {
        context.map.loadImage(
          `https://images.cuppazee.app/types/64/${encodeURIComponent(icon)}.png`,
          (error: any, image: any) => {
            if (error) return;
            context.map.addImage(db.strip(icon), image);
          }
        );
      }
    }
  }, [props.icons.join(",")]);
  return null;
}

export function Marker(props: MarkerProps) {
  return <GLMarker {...props} />;
}
