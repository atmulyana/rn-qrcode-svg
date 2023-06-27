declare module "qr.js" {
    declare type ReturnType = {
        modules: Array<Array<boolean>>,
    };

    declare export default function qr(data: string): ReturnType;
}