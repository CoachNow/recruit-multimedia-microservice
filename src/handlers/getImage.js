const AWS = require('aws-sdk');
const sharp = require('sharp')

const { getImageParamsShape } = require('../validators/getImage.validator');

const getBucketName = (resourceType) => {
  const buckets = {
    'avatar': 'recruit-avatars',
    'bg': 'recruit-backgrounds',
  };

  return buckets[resourceType];
}

const supportedDimensions = {
  'avatar': {
    height: 160,
    width: 160,
  },
  'bg': {
    height: 1500,
    width: 500,
  }
}

module.exports.handler = async (event) => {
  try {
    const S3 = new AWS.S3();

    const params = event.pathParameters;

    await getImageParamsShape.validate(params);
    
    const { type, key } = params;

    const { height, width } = supportedDimensions[type];

    const bucketName = getBucketName(type);

    return S3.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise()
      .then(async (data) => {
        const source = sharp(data.Body);

        const resized = source.resize(+width, +height);
        const formattedImage = resized.toFormat('jpeg')
        const imageBuffer = await formattedImage.toBuffer();
        const imageToBase64 = imageBuffer.toString('base64')

        const response = {
          statusCode: 200,
          headers: {
            'Content-Type': "image/jpeg",
          },
          body: imageToBase64,
          isBase64Encoded: true
        };

        return response;
      })
      .catch((err) => {
        // NOTE: indicates it is not an AWS error
        if(err.statusCode !== 404 ){
          console.error(new Date(), err)
        };

        return { statusCode: 404}}
      );
  } catch (e) {
    console.error(new Date(), e)
    return {
      statusCode: 500,
    }
  }
}