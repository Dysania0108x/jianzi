import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), 'public/doodles/gemini-dog-6.webp');
const targetDir = join(process.cwd(), 'src-tauri/icons');
const target = join(targetDir, 'icon-source.png');

try {
  await access(source);
} catch {
  console.error('缺少小狗素材：public/doodles/gemini-dog-6.webp。请先将原素材包放到 public/doodles/。');
  process.exit(1);
}

await mkdir(targetDir, { recursive: true });
const size = 1024;
const dog = await sharp(source)
  .trim({ background: '#00000000', threshold: 8 })
  .resize(810, 720, { fit: 'inside', withoutEnlargement: false })
  .png()
  .toBuffer();
const { width = 0, height = 0 } = await sharp(dog).metadata();

await sharp({
  create: { width: size, height: size, channels: 4, background: '#C0CB3D' }
})
  .composite([{
    input: dog,
    left: Math.round((size - width) / 2),
    top: Math.round((size - height) / 2) + 35
  }])
  .png()
  .toFile(target);

console.log('已生成探头小狗图标源文件：' + target);
