import PlatformModulePage from "@/components/PlatformModules";

export const metadata = {
  title: "Settings | FlipLogic",
  description: "Theme engine and workspace settings for FlipLogic.",
};

export default function SettingsPage() {
  return <PlatformModulePage kind="settings" />;
}
