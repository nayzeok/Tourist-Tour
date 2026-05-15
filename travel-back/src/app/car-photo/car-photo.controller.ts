import {
  Controller, Get, Post, Delete, Patch, Param, Body,
  UseGuards, Req, ForbiddenException, BadRequestException,
} from '@nestjs/common'
import { CarPhotoService } from './car-photo.service'
import { JwtAuthGuard } from '~/guards/jwt-auth.guard'
import { FastifyRequest } from 'fastify'

interface AuthRequest extends FastifyRequest {
  user?: { id: string; email: string; role: string }
}

@Controller('car-photos')
export class CarPhotoController {
  constructor(private readonly svc: CarPhotoService) {}

  // GET /car-photos/:carId — список фото (публично)
  @Get(':carId')
  async getPhotos(@Param('carId') carId: string) {
    return this.svc.getPhotos(carId)
  }

  // POST /car-photos/:carId — загрузить фото (только ADMIN)
  @Post(':carId')
  @UseGuards(JwtAuthGuard)
  async uploadPhoto(@Param('carId') carId: string, @Req() req: AuthRequest) {
    if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Нет доступа')
    }

    const results: any[] = []
    // Читаем все файлы из multipart
    const parts = (req as any).parts()
    for await (const part of parts) {
      if (part.type !== 'file') continue
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!allowed.includes(part.mimetype)) {
        throw new BadRequestException(`Недопустимый формат: ${part.mimetype}`)
      }
      const chunks: Buffer[] = []
      for await (const chunk of part.file) {
        chunks.push(chunk as Buffer)
      }
      const buffer = Buffer.concat(chunks)
      if (buffer.length > 10 * 1024 * 1024) {
        throw new BadRequestException('Файл слишком большой (макс. 10 МБ)')
      }
      const photo = await this.svc.uploadPhoto(carId, buffer, part.mimetype)
      results.push(photo)
    }

    return results
  }

  // DELETE /car-photos/:id — удалить фото (только ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Нет доступа')
    }
    return this.svc.deletePhoto(id)
  }

  // PATCH /car-photos/:carId/sort — обновить порядок
  @Patch(':carId/sort')
  @UseGuards(JwtAuthGuard)
  async updateSort(
    @Param('carId') carId: string,
    @Body() body: { ids: string[] },
    @Req() req: AuthRequest,
  ) {
    if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Нет доступа')
    }
    return this.svc.updateSortOrder(body.ids)
  }
}
