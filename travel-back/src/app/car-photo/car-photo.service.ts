import { Injectable } from '@nestjs/common'
import { DbService } from '~/db/db.service'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { randomUUID } from 'crypto'

@Injectable()
export class CarPhotoService {
  constructor(private readonly prisma: DbService) {}

  async getPhotos(carId: string) {
    return this.prisma.carPhoto.findMany({
      where: { carId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async uploadPhoto(carId: string, buffer: Buffer, mimetype: string): Promise<any> {
    const ext = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg'
    const filename = `${randomUUID()}.${ext}`
    const dir = join(process.cwd(), 'uploads', 'cars', carId)
    mkdirSync(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    const url = `/uploads/cars/${carId}/${filename}`
    return this.prisma.carPhoto.create({
      data: { carId, filename, url },
    })
  }

  async deletePhoto(id: string) {
    const photo = await this.prisma.carPhoto.findUnique({ where: { id } })
    if (!photo) return null

    // Удаляем файл с диска
    try {
      const filePath = join(process.cwd(), photo.url.replace(/^\//, ''))
      await unlink(filePath)
    } catch { /* файл уже удалён */ }

    return this.prisma.carPhoto.delete({ where: { id } })
  }

  async updateSortOrder(ids: string[]) {
    await Promise.all(
      ids.map((id, i) =>
        this.prisma.carPhoto.update({ where: { id }, data: { sortOrder: i } }),
      ),
    )
    return { ok: true }
  }
}
