/**
 * https://github.com/atmulyana/rn-qrcode-svg
 */
import * as React from 'react';
import type {ImageProps as RNImageProps} from 'react-native';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {ErrorCorrectionLevel, Version} from '@atmulyana/qr-code';
import qr from '@atmulyana/qr-code';
import {Svg} from 'react-native-svg';
import type {ImageProps} from 'react-native-svg/src/elements/Image';

export interface ImageProp extends ImageProps {
    asBackground?: boolean;
    centerized?: boolean;
    href: RNImageProps['source'] | string;
}

type ECLEnum = keyof ErrorCorrectionLevel;
export type QRCodeProp = {
    bgColor?: ColorValue,
    ecl?: ECLEnum | ErrorCorrectionLevel[ECLEnum],
    fgColor?: ColorValue,
    logo?: ImageProp,
    onError?: (message: string) => any,
    size?: number,
    value: Parameters<typeof qr>[0],
    version?: Version,
};

declare var QRCode: ReturnType<typeof React.forwardRef<Svg, QRCodeProp>>; //Generic arguments are in reverse order if compared to Flow `React.forwardRef`
export default QRCode;

declare var Data: typeof qr.Data;
declare var Mode: typeof qr.Mode;
declare var ECL: typeof qr.ErrorCorrectionLevel;
export {Data, Mode, ECL}