/**
 * https://github.com/atmulyana/rn-qrcode-svg
 *
 * @flow strict-local
 */
import * as React from 'react';
import {Alert} from 'react-native';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import {Image, Svg, Rect} from 'react-native-svg';
import qr from '@atmulyana/qr-code';
import type {Version} from '@atmulyana/qr-code';

type QRCodeData = ReturnType<typeof qr>;

export type ImageProp = {
    asBackground?: boolean,
    centerized?: boolean,
    height?: number | string,
    href: ImageSource | string,
    opacity?: number | string,
    preserveAspectRatio?: string,
    width?: number | string,
    x?: number | string,
    y?: number | string,
    ...
};

export type QRCodeProp = {
    bgColor?: ColorValue,
    ecl?: $Keys<typeof qr.ErrorCorrectionLevel> | $Values<typeof qr.ErrorCorrectionLevel>,
    fgColor?: ColorValue,
    logo?: ImageProp,
    onError?: string => mixed,
    size?: number,
    value: Parameters<typeof qr>[0],
    version?: Version,
};

const defaultErrorHandler = (err: string) => {
    Alert.alert("Cannot generate QR Code", "QR Code Error");
    console.error(err);
}

function parsePercent(percent: string): number {
    //We consider that the format of `percent` is 'number%'
    //Ignores all invalid formats
    return parseFloat(percent) / 100;
}

const QRCodeInternal: React.AbstractComponent<{...QRCodeProp, $ref?: React.Ref<typeof Svg>}> = React.memo(function QRCode({
    $ref,
    bgColor = 'transparent',
    ecl,
    fgColor = 'black',
    logo,
    onError = defaultErrorHandler,
    size = 128,
    value,
    version,
}) {
    const pixels: Array<React.Element<typeof Rect>> = [];
    const size2 = parseInt(size); //runtime check: makes sure `size` is an integer or coerces it to be integer
    let pixelSize = 0,
        bgColor2 = bgColor,
        fgColor2 = fgColor,
        isError = false;
    if (typeof(bgColor2) == 'string') bgColor2 = bgColor2.toLowerCase();
    if (typeof(fgColor2) == 'string') fgColor2 = fgColor2.toLowerCase();
    
    const handleError = (message: string) => {
        if (typeof(onError) == 'function') onError(message);
        isError = true;
    }

    const cells: ?QRCodeData["modules"] = React.useMemo(
        () => {
            try {
                let ecl2: number | void;
                if (typeof(ecl) == 'number') ecl2 = ecl;
                else ecl2 = ecl && qr.ErrorCorrectionLevel[ecl];
                return qr(
                    value,
                    {
                        errorCorrectionLevel: ecl2,
                        version
                    }
                ).modules
            }
            catch(err) {
                let message: string;
                if (err instanceof Error) message = err.message;
                else message = err + '';
                handleError(message);
                return null;
            }
        },
        [value, ecl, version]
    );
    
    if (!isError) {
        if (isNaN(size2) || cells && size2 < cells.length)
            handleError("`size` is invalid number or has too small value");
        else if (cells) {
            pixelSize = size2 / cells.length;
            cells.forEach((row, rowIndex) => 
                row.forEach((column, columnIndex) =>
                    column && pixels.push(<Rect
                        key={`${columnIndex}_${rowIndex}`}
                        x={columnIndex * pixelSize}
                        y={rowIndex * pixelSize}
                        width={pixelSize}
                        height={pixelSize}
                        fill={fgColor2}
                    />)
                )
            )
        }
    }

    if (isNaN(size2)) return null;

    let BgLogo: ?React.Element<typeof Image> = null,
        FgLogo: ?React.Element<typeof Image> = null;
    if (logo) {
        const {asBackground, centerized, ...logoProps} = logo;
        if (centerized) {
            let width = 0, height = 0;
            
            if (typeof(logoProps.width) == 'string') {
                const frac = parsePercent(logoProps.width);
                if (!isNaN(frac)) width = size2 * frac;
            }
            else if (typeof(logoProps.width) == 'number') {
                width = logoProps.width;
            }

            if (typeof(logoProps.height) == 'string') {
                const frac = parsePercent(logoProps.height);
                if (!isNaN(frac)) height = size2 * frac;
            }
            else if (typeof(logoProps.height) == 'number') {
                height = logoProps.height;
            }

            if (width <= 0) width = 0.2 * size2;
            if (height <= 0) height = 0.2 * size2;

            logoProps.x = (size2 - width) / 2;
            logoProps.y = (size2 - height) / 2;
        }
        else if (logoProps.x === undefined && logoProps.y === undefined) {
            logoProps.x = 8 * pixelSize; //By default, try not to cover the left-top position probe pattern
        }

        const Logo = <Image {...logoProps} />;
        if (asBackground) BgLogo = Logo;
        else FgLogo = Logo;
    }

    return <Svg ref={$ref} width={size2} height={size2}>
        <Rect
            key="background"
            x={0}
            y={0}
            width={size2}
            height={size2}
            fill={bgColor2}
        />
        {BgLogo}
        {pixels}
        {FgLogo}
    </Svg>;
},

(prevProps, nextProps) => {
    let isEqual = Object.is(prevProps.bgColor, nextProps.bgColor)
               && Object.is(prevProps.ecl, nextProps.ecl)
               && Object.is(prevProps.fgColor, nextProps.fgColor)
               && Object.is(prevProps.onError, nextProps.onError)
               && Object.is(prevProps.size, nextProps.size)
               && Object.is(prevProps.value, nextProps.value)
               && Object.is(prevProps.version, nextProps.version);
    if (isEqual) {
        if (Object.is(prevProps.logo, nextProps.logo)) return true;
        if (
            !prevProps.logo || typeof(prevProps.logo) != 'object' ||
            !nextProps.logo || typeof(nextProps.logo) != 'object'
        ) return false;
        const prevLogoProps = prevProps.logo,
              nextLogoProps = nextProps.logo;
        return !prevLogoProps.asBackground == !nextLogoProps.asBackground
            && !prevLogoProps.centerized == !nextLogoProps.centerized
            && Object.is(prevLogoProps.height, nextLogoProps.height)
            && Object.is(prevLogoProps.href, nextLogoProps.href)
            && Object.is(prevLogoProps.opacity, nextLogoProps.opacity)
            && Object.is(prevLogoProps.preserveAspectRatio, nextLogoProps.preserveAspectRatio)
            && Object.is(prevLogoProps.width, nextLogoProps.width)
            && Object.is(prevLogoProps.x, nextLogoProps.x)
            && Object.is(prevLogoProps.y, nextLogoProps.y);
    }
    return false;
});

const QRCode: React.AbstractComponent<QRCodeProp> = React.forwardRef(
    (props: QRCodeProp, ref: React.Ref<typeof Svg>) => <QRCodeInternal {...props} $ref={ref} />
);

export default QRCode;
export const Data = qr.Data;
export const Mode = qr.Mode;
export const ECL = qr.ErrorCorrectionLevel;