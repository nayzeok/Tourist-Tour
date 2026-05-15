import { Module } from '@nestjs/common'
import { DbModule } from '~/db/db.module'
import { AuthModule } from '~/app/auth/auth.module'
import { UserModule } from '~/app/user/user.module'
import { CarPhotoController } from './car-photo.controller'
import { CarPhotoService } from './car-photo.service'

@Module({
  imports: [DbModule, AuthModule, UserModule],
  controllers: [CarPhotoController],
  providers: [CarPhotoService],
  exports: [CarPhotoService],
})
export class CarPhotoModule {}
