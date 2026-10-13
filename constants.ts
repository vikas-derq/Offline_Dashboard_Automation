export const FEATURE_PREFIX_FIELD = 'example';
export const CUSTOMER_LOGIN_ENDPOINT = '/v1/customer/login';
export const CUSTOMER_LOGOUT_ENDPOINT = '/v1/customer/logout';
export const CUSTOMER_CHANGE_PASSWORD_ENDPOINT = '/v1/customer/change_password';
export const CLASSWISE_COUNTS_ENDPOINT = '/v1/reports/counts/classwise';
export const TIMEWISE_COUNTS_ENDPOINT = '/v1/reports/counts/timewise';
export const DAYWISE_COUNTS_ENDPOINT = '/v1/reports/counts/daywise';
export const ZONEWISE_COUNTS_ENDPOINT = '/v1/reports/counts/zonewise';
export const CPU_HEALTH_SUMMARY_ENDPOINT = '/v1/reports/health/cpu_health_summary';
export const PHF_COUNTS_ENDPOINT = '/v1/reports/counts/phf';
export const DOWWISE_COUNTS_ENDPOINT = '/v1/reports/counts/dowwise';
export const TMC_COUNTS_ENDPOINT = '/v1/reports/counts/tmc';
export const SPEED_DOWWISE_ENDPOINT = '/v1/reports/speeds/dowwise';
export const SPEED_ZONEWISE_ENDPOINT = '/v1/reports/speeds/zonewise';
export const SPEED_BASIC_ENDPOINT = '/v1/reports/speeds/basic';
export const SYSTEM_DOWNTIME_ENDPOINT = '/v1/reports/system_downtime';

export function getBaseUrlByFeature(_featureName?: string): string {
  return process.env.BASE_API_URL || '';
}
