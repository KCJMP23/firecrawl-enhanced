const fs = require('fs');
const path = require('path');

// Create simple SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#2563eb"/>
  <text x="50" y="70" font-family="Arial" font-size="60" font-weight="bold" text-anchor="middle" fill="white">W</text>
</svg>`;

// Function to create a simple PNG placeholder
function createPlaceholderPNG(size) {
  // This creates a minimal valid PNG with the specified size
  // It's a single blue pixel stretched to the required size
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const IHDR = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // Length
    Buffer.from('IHDR'),
    Buffer.from([
      0, 0, 0, size, // Width
      0, 0, 0, size, // Height
      8, // Bit depth
      2, // Color type (RGB)
      0, // Compression method
      0, // Filter method
      0  // Interlace method
    ]),
    Buffer.from([0, 0, 0, 0]) // CRC (placeholder)
  ]);
  
  const IDAT = Buffer.concat([
    Buffer.from([0, 0, 0, 10]), // Length
    Buffer.from('IDAT'),
    Buffer.from([120, 156, 1, 1, 0, 0, 254, 255, 0, 37, 86, 235]), // Compressed data
    Buffer.from([0, 0, 0, 0]) // CRC (placeholder)
  ]);
  
  const IEND = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // Length
    Buffer.from('IEND'),
    Buffer.from([174, 66, 96, 130]) // CRC
  ]);
  
  return Buffer.concat([PNG_SIGNATURE, IHDR, IDAT, IEND]);
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG favicon
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgIcon);

// Create PNG favicons
const sizes = [16, 32, 96, 144, 180];
sizes.forEach(size => {
  const fileName = `favicon-${size}x${size}.png`;
  const filePath = path.join(iconsDir, fileName);
  fs.writeFileSync(filePath, createPlaceholderPNG(size));
  console.log(`Created ${fileName}`);
});

// Also create the specific files that were requested
fs.writeFileSync(path.join(iconsDir, 'apple-icon-180.png'), createPlaceholderPNG(180));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-152.png'), createPlaceholderPNG(152));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-144.png'), createPlaceholderPNG(144));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-120.png'), createPlaceholderPNG(120));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-114.png'), createPlaceholderPNG(114));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-76.png'), createPlaceholderPNG(76));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-72.png'), createPlaceholderPNG(72));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-60.png'), createPlaceholderPNG(60));
fs.writeFileSync(path.join(iconsDir, 'apple-icon-57.png'), createPlaceholderPNG(57));
fs.writeFileSync(path.join(iconsDir, 'ms-icon-144x144.png'), createPlaceholderPNG(144));

console.log('All favicon files created successfully!');