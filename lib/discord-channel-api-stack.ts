import * as cdk from "@aws-cdk/core";
import * as ECR from "@aws-cdk/aws-ecr";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { ContainerImage } from "@aws-cdk/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { ApplicationProtocol } from "@aws-cdk/aws-elasticloadbalancingv2";

class DiscordChannelApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    const {
      AWS_ACCOUNT,
      DISCORD_SERVER_ID,
      DISCORD_CHANNEL_ID,
      DISCORD_BOT_TOKEN,
      CERTIFICATE_ARN,
      CERTIFICATE_DOMAIN,
    } = process.env;

    super(scope, id, {
      env: {
        account: AWS_ACCOUNT as string,
        region: "us-west-2",
      },
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      "DiscordApiDomainCert",
      CERTIFICATE_ARN as string
    );

    const ecr = new ECR.Repository(this, `AcornApiImgRepo`, {
      repositoryName: "kt-discord-channel-api",
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
      DISCORD_SERVER_ID: DISCORD_SERVER_ID as string,
      DISCORD_CHANNEL_ID: DISCORD_CHANNEL_ID as string,
      DISCORD_BOT_TOKEN: DISCORD_BOT_TOKEN as string,
    };

    const domain = CERTIFICATE_DOMAIN as string;

    const serviceName = "DiscordChannelApi";
    if (!containerPort) {
      throw new Error(
        "Cannot create load-balanced Fargate Service without a value for `containerPort`"
      );
    }

    const albService = new ApplicationLoadBalancedFargateService(
      this,
      serviceName,
      {
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
        desiredCount: 1,
        certificate,
        domainName: domain,
      }
    );

    albService.targetGroup.configureHealthCheck({ path: "/healthcheck" });
  }
}

export default DiscordChannelApiStack;
