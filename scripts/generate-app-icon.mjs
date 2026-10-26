import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), 'public/doodles/gemini-dog-6.webp');
const targetDir = join(process.cwd(), 'src-tauri/icons');
const target = join(targetDir, 'icon-source.png');
try { await access(source); } catch {
  console.error('缺少原始小狗素材：public/doodles/gemini-dog-6.webp');
  process.exit(1);
}
await mkdir(targetDir, { recursive: true });

const size = 1024;
const corner = 226;
const roundedBackground = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${corner}" ry="${corner}" fill="#C0CB3D"/></svg>`
);

const dog = await sharp(source)
  .trim({ background: '#00000000', threshold: 8 })
  .resize(760, 670, { fit: 'inside', withoutEnlargement: true })
  .png()
  .toBuffer();
const meta = await sharp(dog).metadata();
const width = meta.width ?? 0;
const height = meta.height ?? 0;
if (!width || !height) throw new Error('小狗素材尺寸无效');
const left = Math.round((size - width) / 2);
const top = Math.round((size - height) / 2) + 25;

await sharp(roundedBackground)
  .composite([{ input: dog, left, top }])
  .png()
  .toFile(target);
console.log('已生成圆角透明背景的 macOS 图标：' + target);
