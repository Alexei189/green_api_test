import type { GreenApiCredentials } from "../../api/types";

export type InstanceSettingsProps = {
  credentials: GreenApiCredentials;
  chatId: string;
  onSave: (credentials: GreenApiCredentials, chatId: string) => void;
};
