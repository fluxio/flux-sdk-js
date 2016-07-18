import { version } from '../../package.json';

export const DEBUG = process.env.NODE_ENV !== 'production';
export const VERSION = version;
export const USER_AGENT = `js-sdk/${VERSION}`;
export const PLATFORM = `browser/js-sdk/${VERSION}`;
