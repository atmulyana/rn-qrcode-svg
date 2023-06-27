/**
 * https://github.com/atmulyana/rn-qrcode-svg
 *
 * @flow strict-local
 * 
 * It's a rewritten code from https://github.com/rishichawda/react-native-qrcode-generator
 * It uses SVG rather than WebView which renders HTML canvas. Using SVG is faster to render.
 */
import * as React from 'react';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {Svg, Rect} from 'react-native-svg';
import qr from 'qr.js';

export type QRCodeProp = {
    value: string,
    size?: number,
    bgColor?: ColorValue,
    fgColor?: ColorValue,
};


function utf16to8(str: string): string {
    let len = str.length,
        out = new Uint8Array(len * 3),
        j = 0;
    for (let i = 0; i < len; i++) {
        let c = str.charCodeAt(i);
        if (c >= 0x0001 && c <= 0x007f) {
            out[j++] = c;
        } else if (c > 0x07ff) {
            out[j++] = 0xe0 | ((c >> 12) & 0x0f);
            out[j++] = 0x80 | ((c >> 6) & 0x3f);
            out[j++] = 0x80 | ((c >> 0) & 0x3f);
        } else {
            out[j++] = 0xc0 | ((c >> 6) & 0x1f);
            out[j++] = 0x80 | ((c >> 0) & 0x3f);
        }
    }
    return String.fromCharCode.apply(null, out.subarray(0, j));
};

const QRCode: React.AbstractComponent<QRCodeProp> = React.memo(function QRCode({
    value,
    bgColor = 'transparent',
    fgColor = 'black',
    size = 128,
}) {
    if (typeof(value) != 'string') //runtime check
        throw "`value` prop must be a string"
    const size2 = parseInt(size); //runtime check: makes sure `size` is an integer or coerces it to be integer
    const cells = qr( utf16to8(value) ).modules;
    if (isNaN(size2) || size2 < cells.length)
        throw "`size` is invalid number or has too small value";
    const pixelSize = size2 / cells.length;
    let color: ColorValue;
    
    return <Svg width={size2} height={size2}>
        {cells.map((row, rowIndex) => 
            row.map((column, columnIndex) =>
                <Rect
                    key={`${columnIndex}_${rowIndex}`}
                    x={columnIndex * pixelSize}
                    y={rowIndex * pixelSize}
                    width={pixelSize}
                    height={pixelSize}
                    fill={color = column ? fgColor : bgColor, typeof(color) == 'string' ? color.toLowerCase() : color}
                />
            )
        )}
    </Svg>;
})

export default QRCode;