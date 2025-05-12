const sharp = require('sharp');

// Create a modern icon with a gradient background and a chain symbol
const svgIcon = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c4dff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="256" fill="url(#grad)"/>
  <g transform="translate(512, 512)" fill="white">
    <path d="M-200,-50 C-200,-150 -100,-200 0,-200 C100,-200 200,-150 200,-50 L150,-50 C150,-120 75,-150 0,-150 C-75,-150 -150,-120 -150,-50 C-150,20 -75,50 0,50 L0,100 C-100,100 -200,50 -200,-50 Z" />
    <path d="M200,50 C200,150 100,200 0,200 C-100,200 -200,150 -200,50 L-150,50 C-150,120 -75,150 0,150 C75,150 150,120 150,50 C150,-20 75,-50 0,-50 L0,-100 C100,-100 200,-50 200,50 Z" />
  </g>
</svg>
`;

// Generate the main icon
sharp(Buffer.from(svgIcon))
  .toFile('assets/images/icon.png')
  .then(() => {
    // Generate the favicon
    return sharp(Buffer.from(svgIcon))
      .resize(192, 192)
      .toFile('assets/images/favicon.png');
  })
  .then(() => {
    console.log('Icons generated successfully!');
  })
  .catch(err => {
    console.error('Error generating icons:', err);
  }); 