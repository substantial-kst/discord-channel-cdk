#!/usr/bin/env node
import "source-map-support/register";
import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { DiscordChannelS3Stack } from "../lib/discord-channel-s3-stack";
import DiscordChannelApiStack from "../lib/discord-channel-api-stack";

dotenv.config({});
const {
    PROJECT_NAME,
  } = process.env;

const app = new cdk.App();
new DiscordChannelS3Stack(app, `${PROJECT_NAME}S3Stack`);
new DiscordChannelApiStack(app, `${PROJECT_NAME}ApiStack`);
