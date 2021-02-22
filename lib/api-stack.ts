import * as cdk from "@aws-cdk/core";
import * as ECR from "@aws-cdk/aws-ecr";
import { Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { ApplicationProtocol } from "@aws-cdk/aws-elasticloadbalancingv2";
import {Certificate, CertificateValidation} from "@aws-cdk/aws-certificatemanager";
import { HostedZone } from "@aws-cdk/aws-route53";

class ApiStack extends cdk.Stack {
  readonly certificate: Certificate;
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    const {
      DISCORD_BOT_TOKEN,
      CERTIFICATE_DOMAIN,
      PROJECT_NAME,
    } = process.env;

    super(scope, id, props);

    this.certificate = new Certificate(this, `${PROJECT_NAME}Certificate`, {
        domainName: `${CERTIFICATE_DOMAIN}`,
        subjectAlternativeNames: [`discord-overlay.${CERTIFICATE_DOMAIN}`,`discord-overlay-api.${CERTIFICATE_DOMAIN}`],
        validation: CertificateValidation.fromDns(
HostedZone.fromLookup(this, 'DiscordOverlayZonefile', { domainName: `${CERTIFICATE_DOMAIN}`})
        )
    })

    const ecr = new ECR.Repository(this, `DiscordApiImgRepo`, {
      repositoryName: "discord-overlay-api",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Configuration
    const imageName = "latest";
    const containerPort = 4000;
    const fargateResourceLimits = {
      memoryLimitMiB: 1024,
      cpu: 512,
    };

    const environment = {
      DISCORD_BOT_TOKEN: DISCORD_BOT_TOKEN as string,
    };

    const domain = CERTIFICATE_DOMAIN as string;

    const serviceName = "DiscordOverlayApi";
    if (!containerPort) {
      throw new Error(
        "Cannot create load-balanced Fargate Service without a value for `containerPort`"
      );
    }

    const albService = new ApplicationLoadBalancedFargateService(
      this,
      serviceName,
      {
        cluster: new Cluster(this, "DiscordOverlayCluster", {
          clusterName: "DiscordOverlay",
        }),
        ...fargateResourceLimits,
        taskImageOptions: {
          image: ContainerImage.fromEcrRepository(ecr, imageName),
          containerPort,
          containerName: `${serviceName}Container`,
          environment,
        },
        serviceName,
        assignPublicIp: true,
        protocol: ApplicationProtocol.HTTPS,
        certificate: this.certificate,
        domainName: `discord-overlay.${domain}`,
        domainZone: HostedZone.fromLookup(this, "DiscordApiDomainZone", {
          domainName: domain,
        }),
        desiredCount: 1,
      }
    );

    albService.targetGroup.configureHealthCheck({ path: "/healthcheck" });
  }
}

export default ApiStack;
