import * as cdk from "@aws-cdk/core";
import * as S3 from "@aws-cdk/aws-s3";

export class S3Stack extends cdk.Stack {
  readonly websiteBucket: S3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const { CERTIFICATE_DOMAIN } = process.env;
    const suffix = CERTIFICATE_DOMAIN?.split('.')[0].toLowerCase();
    const bucketSuffix = `-${CERTIFICATE_DOMAIN ? suffix : ''}`;
    this.websiteBucket = new S3.Bucket(this, "S3Bucket", {
      bucketName: `discord-overlay${bucketSuffix}`,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, "DiscordOverlayBucketName", {
      value: this.websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, "DiscordOverlayBucketUrl", {
      value: this.websiteBucket.bucketWebsiteUrl,
    });
  }
}
