import * as cdk from "@aws-cdk/core";
import * as ECR from "@aws-cdk/aws-ecr";
import { Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { ApplicationProtocol } from "@aws-cdk/aws-elasticloadbalancingv2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone } from "@aws-cdk/aws-route53";

class DiscordChannelApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    const {
      AWS_ACCOUNT,
      DISCORD_BOT_TOKEN,
      CERTIFICATE_ARN,
      CERTIFICATE_DOMAIN,
      PROJECT_NAME,
    } = process.env;

    super(scope, id, {
      env: {
        account: AWS_ACCOUNT as string,
        region: "us-west-2",
      },
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      `${PROJECT_NAME}ApiDomainCert`,
      CERTIFICATE_ARN as string
    );

    const ecr = new ECR.Repository(this, `${PROJECT_NAME}ApiImgRepo`, {
      repositoryName: `${PROJECT_NAME}-api`,
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

    const serviceName = `${PROJECT_NAME}Api`;
    if (!containerPort) {
      throw new Error(
        "Cannot create load-balanced Fargate Service without a value for `containerPort`"
      );
    }

    const albService = new ApplicationLoadBalancedFargateService(
      this,
      serviceName,
      {
        cluster: new Cluster(this, `${PROJECT_NAME}ApiStackCluster`, {
          clusterName: `${PROJECT_NAME}`,
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
        certificate,
        domainName: `api.${domain}`,
        domainZone: HostedZone.fromLookup(this, `${PROJECT_NAME}ApiDomainZone`, {
          domainName: domain,
        }),
        desiredCount: 1,
      }
    );

    albService.targetGroup.configureHealthCheck({ path: "/healthcheck" });
  }
}

export default DiscordChannelApiStack;
