// 此文件由脚本 genExportContent 自动生成，不用修改
import { exposeLib } from 'hel-lib-proxy';
import type { LibProperties } from './libProperties';
import { LIB_NAME } from '../configs/subApp';

export const lib = exposeLib<LibProperties>(LIB_NAME);

export const {
  HelloMono,
} = lib;

export type Lib = LibProperties;

export default lib;

