import * as cdk from "@aws-cdk/core";
import {Certificate, CertificateValidation} from "@aws-cdk/aws-certificatemanager";
import { HostedZone } from "@aws-cdk/aws-route53";
import { Repository } from "@aws-cdk/aws-ecr";

class BaseStack extends cdk.Stack {
    readonly certificate: Certificate;
    readonly repository: Repository;

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);
        const { CERTIFICATE_DOMAIN } = process.env;
      
        this.repository = new Repository(this, `DiscordApiImgRepo`, {
            repositoryName: "discord-overlay-api",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          });
      
        this.certificate = new Certificate(this, `DiscordOverlayCertificate`, {
            domainName: `${CERTIFICATE_DOMAIN}`,
            subjectAlternativeNames: [
                `discord-overlay.${CERTIFICATE_DOMAIN}`,
                `discord-overlay-api.${CERTIFICATE_DOMAIN}`
            ],
            validation: CertificateValidation.fromDns(
                HostedZone.fromLookup(this, 'DiscordOverlayZonefile', {
                    domainName: `${CERTIFICATE_DOMAIN}`
                })
            )
        });
    }
}

export default BaseStack;
