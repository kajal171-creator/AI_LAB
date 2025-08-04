export const CLIENT_TYPE = {
  WEB: 'web',
  APP: 'app',
};

export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
};

export const NODE_ENV = {
  DEV: 'development',
  STAGING: 'staging',
  PROD: 'production',
} as const;

export const UPLOAD_STRATEGY = {
  ON_PREM: 'on-prem',
  AWS: 'aws',
};
