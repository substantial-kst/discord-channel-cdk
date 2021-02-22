import * as cdk from "@aws-cdk/core";
import * as CloudFront from "@aws-cdk/aws-cloudfront";
import {Bucket} from "@aws-cdk/aws-s3";
import {Certificate} from "@aws-cdk/aws-certificatemanager";

export class DistributionStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps & { websiteBucket: Bucket; certificate: Certificate}) {
        super(scope, id, props);

        new CloudFront.CloudFrontWebDistribution(this, 'DiscordOverlayDistribution',       {
                originConfigs: [
                    {
                        behaviors: [{ isDefaultBehavior: true }],
                        s3OriginSource: {
                            s3BucketSource: props.websiteBucket,
                        },
                    },
                ],
                defaultRootObject: 'index.html',
                errorConfigurations: [
                    {
                        errorCode: 404,
                        responseCode: 200,
                        errorCachingMinTtl: 0,
                        responsePagePath: '/index.html',
                    },
                ],
                viewerProtocolPolicy: CloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                viewerCertificate: CloudFront.ViewerCertificate.fromAcmCertificate(
                    props.certificate, {
                        aliases: [`discord-overlay.${process.env.CERTIFICATE_DOMAIN}`]
                    }
                ),
            }
        )
    }
}
