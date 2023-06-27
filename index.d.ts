/**
 * https://github.com/atmulyana/rn-qrcode-svg
 */
import * as React from 'react';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type QRCodeProp = {
    value: string,
    size?: number,
    bgColor?: ColorValue,
    fgColor?: ColorValue,
};

export default class QRCode extends React.Component<QRCodeProp> {}