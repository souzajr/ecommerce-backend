const DOServices = {
  name: process.env.FRONTEND_ECOMMERCE_NAME,
  region: 'nyc',
  services: [
    {
      build_command: 'yarn build',
      environment_slug: 'node-js',
      envs: [
        {
          key: 'AMBIENT_MODE',
          scope: 'RUN_AND_BUILD_TIME',
          value: 'PROD',
        },
        {
          key: 'API_URL',
          scope: 'RUN_AND_BUILD_TIME',
          value: `${process.env.API_URL}/${process.env.VERSION}`,
        },
        {
          key: 'SITE_DEVELOPER_URL',
          scope: 'RUN_AND_BUILD_TIME',
          value: 'https://purpletech.com.br',
        },
        {
          key: 'SITE_DEVELOPER',
          scope: 'RUN_AND_BUILD_TIME',
          value: 'PurpleTech',
        },
      ],
      github: {
        branch: 'main',
        deploy_on_push: true,
        repo: 'purpletechbr/ecommerce-frontend',
      },
      http_port: 8080,
      instance_count: 1,
      instance_size_slug: 'basic-xxs',
      name: 'ecommerce-frontend',
      routes: [
        {
          path: '/',
        },
      ],
      run_command: 'yarn start',
      source_dir: '/',
    },
  ],
};

export default DOServices;
