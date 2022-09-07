import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  if (!(process.env.NODE_ENV === 'production')) {
    const options = new DocumentBuilder()
      .addBearerAuth({
        type: 'http',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter JWT token for Admin/User roles. <br >Login with given credentials and copy-paste the access_token returned.',
        in: 'header',
      })
      .setTitle('Licenta')
      .setDescription('Licenta Backend')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
