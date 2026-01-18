export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
  has_community_visible_stats: boolean;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
}

export interface GameDetails {
  appid: number;
  name: string;
  short_description: string;
  header_image: string;
  genres?: Array<{ id: number; description: string }>;
  tags?: Array<{ id: number; description: string }>;
}

export interface GameWithAccounts {
  appid: number;
  name: string;
  picture: string;
  tags: string[];
  userTags: string[]; // User-defined/community tags
  accounts: string[];
}

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
}

