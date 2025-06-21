/*
|--------------------------------------------------------------------------
|
| 对应模块管控台创建应用时填写的应用组名 或 npm 包名
|
|--------------------------------------------------------------------------
*/
import { getIsTestEnv } from './util';

export const LIB_GROUP_NAME = 'mono-comps';

export const LIB_NAME = getIsTestEnv() ? `${LIB_GROUP_NAME}-test` : LIB_GROUP_NAME;
