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

export const ORIGINS = ['http://localhost:4000', 'http://localhost:3000'];


export const GOOGLE_REGEX = {
  DRIVE_FILE: /\/file\/d\/([a-zA-Z0-9-_]+)/,
  DOC_FILE: /\/document\/d\/([a-zA-Z0-9-_]+)/,
};

export const GOOGLE_URLS = {
  DRIVE_EXPORT: (id: string) => `https://drive.google.com/uc?export=download&id=${id}`,
  DOC_EXPORT: (id: string) => `https://docs.google.com/document/d/${id}/export?format=pdf`,
};
