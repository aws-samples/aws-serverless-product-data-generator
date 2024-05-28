# Demo Website

## Local testing
For local development, you will need to copy the generated runtime-config.json file into your /public directory. Ensure you have deployed your infrastructure and then execute the following command from the root of your website directory:

```shell
curl https://`aws cloudformation describe-stacks --query "Stacks[?StackName=='infra-dev'][].Outputs[?contains(OutputKey, 'DistributionDomainName')].OutputValue" --output text`/runtime-config.json > public/runtime-config.json
```

Then you can run the React development server with `pnpm pdk dev`.

## Framework guide

Refer to [Developer Guide](https://aws.github.io/aws-pdk/developer_guides/cloudscape-react-ts-website/index.html)