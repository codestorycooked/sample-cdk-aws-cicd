#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SampleCdkAwsCicdStack } from '../lib/sample-cdk-aws-cicd-stack';

const app = new cdk.App();
new SampleCdkAwsCicdStack(app, 'SampleCdkAwsCicdStack', {
    env: {
        region: 'us-east-1',
        account: 'CHANGEME'

    }
});
