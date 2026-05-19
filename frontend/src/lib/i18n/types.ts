export type Locale = "en" | "vi";

export type LegalParagraph = string | { subheading: string } | { bullets: string[] };

export interface LegalSection {
  title: string;
  content: LegalParagraph[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  footer: string;
}
