import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import type { MapPropsType } from '../types/index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';
import {PostcodeAutoFillLocation} from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";

export type ResourceOverviewMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    marker?: MarkerProps;
    markerIcon?: MarkerIconType;
    markerHref?: string;
    countButton?: {
      show: boolean;
      label?: string;
    }
    ctaButton?: {
      show: boolean;
      label?: string;
      href?: string;
    }
    givenResources?: Array<any>;
    resourceOverviewMapWidget?: dataLayerArray;
    selectedProjects?: Array<any>;
    widgetName?: string;
    locationProx?: PostcodeAutoFillLocation
  };

export type dataLayerArray = {
  datalayer?: DataLayer[];
  enableOnOffSwitching?: boolean;
}

export type DataLayer = {
  id: number | string;
  layer: any;
  icon: any;
  name: string;
  activeOnInit?: boolean;
};