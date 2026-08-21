export type ProjectImage = {
  publicId: string;
  alt: string;
  ratio?: number;
};

export type Stat = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export type AspectRatioOption = 'auto' | '16:9' | '4:3' | '3:2' | '1:1' | '4:5' | '3:4' | '9:16';
export type ColumnSplit = '50/50' | '60/40' | '40/60' | '70/30' | '30/70' | '66/34' | '34/66';
export type TextAlign = 'left' | 'center' | 'right';

export type ProjectBlock =
  | {
      type: "image";
      image: ProjectImage;
      aspect?: AspectRatioOption;
      size?: 'full' | 'contained';
    }
  | {
      type: "imageFeature";
      main: ProjectImage;
      stacked: [ProjectImage, ProjectImage];
      mainSide?: 'left' | 'right';
    }
  | {
      type: "imagePair";
      images: ProjectImage[];
      mobileLayout?: "pair" | "stack";
      split?: ColumnSplit;
      aspect?: AspectRatioOption;
      matchHeight?: boolean;
    }
  | {
      type: "imageText";
      image: ProjectImage;
      text: string;
      imagePosition?: 'left' | 'right';
      layout?: ColumnSplit;
      textAlign?: TextAlign;
      heightFrom?: "text" | "image";
      mobileOrder?: 'imageFirst' | 'textFirst';
      fontFamily?: 'serif' | 'sans';
      bold?: boolean;
      italic?: boolean;
      sizeMobile?: string;
      sizeTablet?: string;
      sizeDesktop?: string;
      tracking?: string;
      leading?: string;
    }
  | {
      type: "keywords";
      items: string[];
      align?: TextAlign;
      style?: 'filled' | 'outline' | 'minimal';
    }
  | {
      type: "quote";
      image: ProjectImage;
      quote: string;
      textColor?: 'light' | 'dark';
      textAlign?: TextAlign;
    }
  | {
      type: "stats";
      title?: string;
      items: Stat[];
      highlight?: Stat;
    }
  | { type: "testimonial"; quote: string; author: string; role: string }
  | {
      type: "text";
      text: string;
      align?: 'left' | 'center' | 'right';
      hasContainer?: boolean;
      widthMode?: 'standard' | 'full' | 'auto';
      fontFamily?: 'serif' | 'sans';
      bold?: boolean;
      italic?: boolean;
      sizeMobile?: string;
      sizeTablet?: string;
      sizeDesktop?: string;
      tracking?: string;
      leading?: string;
    };

export type WorkCase = {
  id?: string;
  slug: string;
  client: string;
  title?: string;
  category: string;
  year: string;
  summary: string;
  cover?: ProjectImage;
  scope?: string[];
  description?: string;
  blocks?: ProjectBlock[];
  created_at?: string;
  updated_at?: string;
  titleStyle?: {
    bold?: boolean;
    italic?: boolean;
    sizeMobile?: string;
    sizeTablet?: string;
    sizeDesktop?: string;
    tracking?: string;
    leading?: string;
  };
};

export type CraftLabArticle = {
  id: string;
  slug: string;
  date: string;
  title: string;
  category: string;
  image: string;
  desc: string;
  aspect?: string;
  content: string;
  blocks?: ProjectBlock[];
  created_at?: string;
  updated_at?: string;
};

export type CategoryOption = "Build Program" | "Shift Program" | "Refresh Program" | "Brand Partnership" | "Estrategia" | "Diseño" | "Cultura" | "Arte";
