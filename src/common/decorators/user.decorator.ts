import { createParamDecorator } from '@nestjs/common';

export const UserParam = createParamDecorator((data, req) => {
  return req.args[0].user;
});
