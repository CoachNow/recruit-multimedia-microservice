const { object, string, mixed } = require('yup');

module.exports.getImageParamsShape = object({
  type: mixed().oneOf(['avatar', 'bg']).required(),
  key: string().required(),
})