import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      .setTitle('Mobarta TM')
      .setDescription('Mobarta Backend')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);
}
bootstrap();
