export type TagTypeSingle = {
  min: number;
  max: number;
  current: number;
  selectedResources: Array<any>;
};

export type TagType = {
  [key: string]: TagTypeSingle;
};

export type { StemBegrootWidgetProps as StemBegroot2WidgetProps } from '../stem-begroot';
