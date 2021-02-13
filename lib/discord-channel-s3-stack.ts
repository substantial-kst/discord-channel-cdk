import * as cdk from "@aws-cdk/core";
import * as S3 from "@aws-cdk/aws-s3";

export class DiscordChannelS3Stack extends cdk.Stack {
  readonly websiteBucket: S3.Bucket;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const {
      PROJECT_NAME,
    } = process.env;

    this.websiteBucket = new S3.Bucket(this, `${PROJECT_NAME}S3Bucket`, {
      // bucketName: "kt-discord-widget",
      bucketName: "kt-discord-widget-v2",
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, `${PROJECT_NAME}S3BucketName`, {
      value: this.websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, `${PROJECT_NAME}S3BucketUrl`, {
      value: this.websiteBucket.bucketWebsiteUrl,
    });
  }
}
