import React from 'react';
import { UpdateWrapper } from "../../screens/Settings/Notifications";
import Select from '../Common/Select';
import { useTranslation } from 'react-i18next';
import useSetting, { ClansAtom } from '../../hooks/useSetting';
import { Box, Button, Checkbox, Heading } from 'native-base';

export interface ClanSettingsModalProps {
  clan_id: number;
  close: () => void;
  levels: number[];
}

export default function ClanSettingsModal({ clan_id, close, levels }: ClanSettingsModalProps) {
  const [options, setOptions] = useSetting(ClansAtom);
  const { t } = useTranslation();
  const goalLevel = Math.min(Math.max(options[clan_id].level, 0), levels.length);
  return (
    <Box bg="regularGray.50" _dark={{ bg: "regularGray.900" }} style={{ borderRadius: 8, padding: 4 }}>
      <UpdateWrapper>
        {update => (
          <Checkbox
            style={{ margin: 8 }}
            value=""
            isChecked={options[clan_id].shadow}
            onChange={checked => {
              options[clan_id].shadow = checked;
              update();
            }}>
            {t("clan:settings_shadow")}
          </Checkbox>
        )}
      </UpdateWrapper>
      <UpdateWrapper>
        {update => (
          <Checkbox
            style={{ margin: 8 }}
            value=""
            isChecked={options[clan_id].subtract}
            onChange={checked => {
              options[clan_id].subtract = checked;
              update();
            }}>
            {t("clan:settings_subtract")}
          </Checkbox>
        )}
      </UpdateWrapper>
      <UpdateWrapper>
        {update => (
          <Checkbox
            style={{ margin: 8 }}
            value=""
            isChecked={options[clan_id].share}
            onChange={checked => {
              options[clan_id].share = checked;
              update();
            }}>
            {t("clan:settings_share")}
          </Checkbox>
        )}
      </UpdateWrapper>
      <Heading ml={1} mt={1} size="md">{t("clan:settings_goal")}</Heading>
      <UpdateWrapper>
        {update => (
          <Select
            m={1}
            value={goalLevel.toString()}
            onValueChange={value => {
              options[clan_id].level = Number(value);
              update();
            }}
            options={levels.map(i => ({
              label: t("clan:level", { level: i }),
              value: i.toString(),
            }))}
          />
        )}
      </UpdateWrapper>
      <Button
        style={{ margin: 4, flex: 1 }}
        onPress={() => {
          close();
          setOptions({ ...options });
        }}>
        {t("clan:settings_done")}
      </Button>
    </Box>
  );
}
