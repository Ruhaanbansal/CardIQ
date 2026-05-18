import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// ... other module imports

@Module({
  imports: [
    // Load .env files automatically
    ConfigModule.forRoot({ isGlobal: true }),
    // Observability: Expose /metrics endpoint for Prometheus scraping
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    // ... AdminModule, OptimizerModule, etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
