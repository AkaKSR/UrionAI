module.exports = {
  apps: [
    {
      name: "urion-phaser",
      script: "pm2",
      args: "serve dist 4173 --spa",
      cwd: "/home/ubuntu/apps/urion-phaser",
      interpreter: "none",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
