const UTC_TIMESTAMP_WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export const parseServerDate = value => {
  if (typeof value === 'string' && UTC_TIMESTAMP_WITHOUT_OFFSET.test(value)) {
    return new Date(`${value.replace(' ', 'T')}Z`);
  }
  return new Date(value);
};
