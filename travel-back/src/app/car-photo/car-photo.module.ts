import { Module } from '@nestjs/common'
import { DbModule } from '~/db/db.module'
import { CarPhotoController } from './car-photo.controller'
import { CarPhotoService } from './car-photo.service'

@Module({
  imports: [DbModule],
  controllers: [CarPhotoController],
  providers: [CarPhotoService],
  exports: [CarPhotoService],
})
export class CarPhotoModule {}
