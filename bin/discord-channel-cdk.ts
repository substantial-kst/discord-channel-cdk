#!/usr/bin/env node
import "source-map-support/register";
import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { S3Stack } from "../lib/s3-stack";
import ApiStack from "../lib/api-stack";
import {DistributionStack} from "../lib/distribution-stack";

dotenv.config({});

const stackProps: cdk.StackProps = {
    env: {
        account: `${process.env.AWS_ACCOUNT}`,
        region: 'us-east-1'
    }
}

const app = new cdk.App();
const { websiteBucket } = new S3Stack(app, "DiscordOverlayS3Stack", stackProps);
const { certificate } = new ApiStack(app, "DiscordOverlayApiStack", stackProps);
new DistributionStack(app, "DiscordOverlayDistribution", {
    ...stackProps,
    websiteBucket,
    certificate
})
