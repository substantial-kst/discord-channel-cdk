import * as cdk from "@aws-cdk/core";
import { Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { ApplicationProtocol } from "@aws-cdk/aws-elasticloadbalancingv2";
import {Certificate} from "@aws-cdk/aws-certificatemanager";
import { HostedZone } from "@aws-cdk/aws-route53";
import { Repository } from "@aws-cdk/aws-ecr";

class ApiStack extends cdk.Stack {
  readonly certificate: Certificate;
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps & { certificate: Certificate; repository: Repository}) {
    const {
      DISCORD_BOT_TOKEN,
      CERTIFICATE_DOMAIN,
    } = process.env;

    super(scope, id, props);

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
          image: ContainerImage.fromEcrRepository(props.repository, imageName),
          containerPort,
          containerName: `${serviceName}Container`,
          environment,
        },
        serviceName,
        assignPublicIp: true,
        protocol: ApplicationProtocol.HTTPS,
        certificate: this.certificate,
        domainName: `discord-overlay-api.${domain}`,
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
