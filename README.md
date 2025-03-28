# Account and Billing System

This repository contains the serverless implementation of an account and billing system using AWS Serverless Application Model (AWS SAM). Currently, it implements a secure authentication system using magic links for registration and login.

## Features

- Magic Link Authentication
  - Secure registration and login using email-based magic links
  - No password management required
  - Enhanced security through time-limited, single-use links

## Prerequisites

To use this project, you need the following tools:

* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 20](https://nodejs.org/en/), including the npm package management tool
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)
* AWS CLI configured with appropriate credentials

## Development Setup

1. Configure AWS CLI with your development profile:
```bash
aws configure --profile Development
```

2. Install project dependencies:
```bash
npm install
```

## Deployment

To deploy the application to your development environment:

```bash
sam build
sam deploy --profile Development
```

The deployment will create the necessary AWS resources defined in the `template.yaml` file, including Lambda functions, API Gateway endpoints, and DynamoDB tables.

## Project Structure

- `src/` - Source code for Lambda functions
- `events/` - Test events for local function invocation
- `__tests__/` - Unit tests for the application code
- `template.yaml` - AWS SAM template defining the application's AWS resources

## Local Development

To test functions locally:

```bash
# Build the application
sam build

# Start the API locally
sam local start-api

# Test specific functions
sam local invoke <function-name> --event events/<event-file>.json
```

## Testing

Run the test suite:

```bash
npm test
```

## Cleanup

To remove the deployed application and its resources:

```bash
sam delete --stack-name account-and-billing --profile Development
```

## Future Enhancements

This repository will be expanded to include:
- User profile management
- Subscription management
- Billing and payment processing
- Usage tracking and reporting
- Team and organization management

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [AWS Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/)
