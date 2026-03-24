import { loadWidget } from '@openstad-headless/lib/load-widget';
import React from 'react';

import { StemBegroot2Inner } from './StemBegroot2Inner';
import type { StemBegroot2WidgetProps } from './types';

export function StemBegroot2(props: StemBegroot2WidgetProps) {
  return <StemBegroot2Inner {...props} />;
}

StemBegroot2.loadWidget = loadWidget;

/** Embed scripts and older imports expect this name; same implementation as {@link StemBegroot2}. */
export { StemBegroot2 as StemBegroot };
