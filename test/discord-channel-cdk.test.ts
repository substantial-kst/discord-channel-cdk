import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import DiscordChannelCdk = require("../lib/discord-channel-s3-stack");

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new DiscordChannelCdk.DiscordChannelS3Stack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
