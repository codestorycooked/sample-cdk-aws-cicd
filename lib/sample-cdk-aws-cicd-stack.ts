
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import { LogDriver, PortMapping, Cluster, FargateTaskDefinition, ContainerImage } from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export class SampleCdkAwsCicdStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the ECR Repository
    const ecrRespository = new ecr.Repository(this, 'sample-app-repository', { repositoryName: 'sample-app-repository' })
    console.log(ecrRespository.repositoryUri);

    // Create VPC and Fargate Cluster
    // NOTE: Limit AZs to avoid reaching resource quotas
    const vpc = new ec2.Vpc(this, 'sample-app-vpc', { maxAzs: 1 });

    new Cluster(this, 'sample-app-cluster', { vpc, clusterName: "sample-app-cluster" });

    // Create the ECS Task Definition with placeholder container (and named Task Execution IAM Role)
    const executionRole = new iam.Role(this, 'sample-app-execution-role', {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: 'sample-app-execution-role'

    });
    executionRole.addToPolicy(new iam.PolicyStatement(
      {
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]

      }
    ));

    const taskDefinition = new FargateTaskDefinition(this,
      'sample-service-definition', {
      executionRole,
      family: 'sample-service-task-definition',

    });

    const port: PortMapping[] = [{
      containerPort: 80

    }];
    taskDefinition.addContainer('sample-task-container', {

      image: ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      logging: LogDriver.awsLogs({ streamPrefix: 'sample-service' }),

    }).addPortMappings(...port);


    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'sample-load-balancer', {
      taskDefinition,
      serviceName: 'sample-service'
    })

  }
}

