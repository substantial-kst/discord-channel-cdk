import * as cdk from "@aws-cdk/core";
import * as S3 from "@aws-cdk/aws-s3";

export class DiscordChannelS3Stack extends cdk.Stack {
  readonly websiteBucket: S3.Bucket;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.websiteBucket = new S3.Bucket(this, "DiscordChannelWidgetS3Bucket", {
      bucketName: "kt-discord-widget",
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, "DiscordChannelWidgetBucketName", {
      value: this.websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, "DiscordChannelWidgetBucketUrl", {
      value: this.websiteBucket.bucketWebsiteUrl,
    });
  }
}
