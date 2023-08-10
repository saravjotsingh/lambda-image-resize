const SDK = require("aws-sdk");
const SHARP = require("sharp");
// instantiate S3 helper
const S3 = new SDK.S3();

// pull in environment variables that we specified in lambda settings
const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;

// export handler function that is needed for lambda execution
exports.handler = function (event) {
  const params = event["Records"][0]["s3"]["object"];
  const path = params.key;
  console.log(params, path);
  const width = parseInt(100, 10);
  const height = parseInt(100, 10);

  // fetch the original image from S3
  S3.getObject({ Bucket: BUCKET, Key: path }, (err, data) => {gi
    console.log("------> inside the function of s3", data, err);
    SHARP(data.Body)
      .resize(width, height)
      .toFormat("jpg")
      .toBuffer()
      .then((buffer) =>
        // create a new entry in S3 with our resized image
        // the key is unique per size - i.e. 300x300/image.jpg
        S3.putObject(
          {
            Body: buffer,
            Bucket: BUCKET,
            Key: `thumbnail/${path}`,
            ContentType: "image/jpeg",
            ContentDisposition: "inline", // ensure that the browser will display S3 images inline
          },
          () => {
            // generate lambda response with the location of the newly uploaded file
            const response = {
              statusCode: "301",
              headers: { location: `${BUCKET_URL}/${`thumbnail/${path}`}` },
              body: "",
            };

            return response;
          }
        )
      );
  });
};
