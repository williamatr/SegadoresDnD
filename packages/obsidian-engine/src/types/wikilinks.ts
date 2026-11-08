export interface WikilinkMatch {
  raw: string;
  target: string;
  alias?: string;
  heading?: string;
  isEmbed: boolean;
}

export type WikilinkResolver = (match: WikilinkMatch) => string;
