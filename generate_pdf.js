import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import katex from 'katex';
import { execSync } from 'child_process';

const baseDir = path.resolve('..', '..', 'SoluciónEjercicios');
const mdPath = path.join(baseDir, 'PMC_Documento_Consolidado_Ejercicios_1_al_5_Quack.md');
const outHtmlPath = path.join(baseDir, 'PMC_Documento_Consolidado_Ejercicios_1_al_5_Quack.html');
const outPdfPath = path.join(baseDir, 'PMC_Documento_Consolidado_Ejercicios_1_al_5_Quack.pdf');

console.log('Reading Markdown from:', mdPath);
let md = fs.readFileSync(mdPath, 'utf8');

// Logo
const logoPath = path.resolve('public/brand/quack-logo.png');
let logoDataUri = '';
if (fs.existsSync(logoPath)) {
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  logoDataUri = `data:image/png;base64,${logoBase64}`;
}

// KaTeX CSS
const katexCssPath = path.resolve('node_modules/katex/dist/katex.min.css');
let katexCss = '';
if (fs.existsSync(katexCssPath)) {
  katexCss = fs.readFileSync(katexCssPath, 'utf8');
}

// Custom renderer for marked
const renderer = new marked.Renderer();

// Render mermaid code blocks
renderer.code = function({ text, lang }) {
  if (lang === 'mermaid') {
    return `<div class="mermaid-container"><pre class="mermaid">\n${text}\n</pre></div>`;
  }
  return `<pre><code class="language-${lang || ''}">${text}</code></pre>`;
};

// Process LaTeX before markdown parsing
// 1. Display math: $$...$$
const displayMathList = [];
md = md.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
  try {
    const rendered = katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    const idx = displayMathList.length;
    displayMathList.push(rendered);
    return `%%DISPLAY_MATH_${idx}%%`;
  } catch (e) {
    return match;
  }
});

// 2. Inline math: $...$ (avoiding \$)
const inlineMathList = [];
md = md.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, expr) => {
  // If it's a price like "$15 USD" or "$19.900 COP", don't treat as math unless it has math symbols
  if (/^\s*\d+([.,]\d+)?\s*(USD|COP)?\s*$/i.test(expr)) {
    return match;
  }
  try {
    const rendered = katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    const idx = inlineMathList.length;
    inlineMathList.push(rendered);
    return `%%INLINE_MATH_${idx}%%`;
  } catch (e) {
    return match;
  }
});

// Unescape literal dollar signs: \$ -> $
md = md.replace(/\\\$/g, '$');

// Convert Markdown to HTML
let bodyHtml = marked(md, { renderer, gfm: true, breaks: true });

// Restore Display Math
bodyHtml = bodyHtml.replace(/%%DISPLAY_MATH_(\d+)%%/g, (match, idx) => {
  return `<div class="math-display">${displayMathList[Number(idx)]}</div>`;
});

// Restore Inline Math
bodyHtml = bodyHtml.replace(/%%INLINE_MATH_(\d+)%%/g, (match, idx) => {
  return `<span class="math-inline">${inlineMathList[Number(idx)]}</span>`;
});

// Wrap blockquotes into styled Quack callouts
bodyHtml = bodyHtml.replace(/<blockquote>([\s\S]+?)<\/blockquote>/g, (match, content) => {
  return `<div class="quack-callout">${content}</div>`;
});

// Build Full HTML Document
const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Quack MVP — Documento Consolidado Ejercicios #1 al #5</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${katexCss}

    @page {
      size: letter;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #717684;
      }
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #3B4151; /* Gunmetal Gray */
      background: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    /* Quack Header Banner */
    .header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #FFF7D1 0%, #FFE978 40%, #FFC800 100%);
      border: 1.5px solid #FFC800;
      border-radius: 14px;
      padding: 16px 22px;
      margin-bottom: 22px;
      box-shadow: 0 4px 12px rgba(255, 200, 0, 0.18);
      page-break-after: avoid;
      break-after: avoid;
    }

    .header-title-box h1 {
      font-family: 'Comfortaa', cursive, sans-serif;
      font-size: 15pt;
      font-weight: 700;
      color: #3B4151;
      margin: 0 0 4px 0;
      line-height: 1.25;
    }

    .header-title-box h2 {
      font-family: 'Comfortaa', cursive, sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: #D96B43; /* Caramel Brown */
      margin: 0 0 6px 0;
    }

    .header-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 20px;
      background: #FFFFFF;
      color: #3B4151;
      border: 1px solid rgba(59, 65, 81, 0.2);
    }

    .badge-primary {
      background: #3B4151;
      color: #FFC800;
      border: none;
    }

    .badge-accent {
      background: #D96B43;
      color: #FFFFFF;
      border: none;
    }

    .header-logo {
      width: 74px;
      height: 74px;
      object-fit: contain;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }

    /* Headings */
    h1, h2, h3, h4 {
      font-family: 'Comfortaa', cursive, sans-serif;
      color: #3B4151;
      page-break-after: avoid;
      break-after: avoid;
    }

    h2 {
      font-size: 13.5pt;
      border-bottom: 2.5px solid #FFC800;
      padding-bottom: 5px;
      margin-top: 26px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }

    h3 {
      font-size: 11pt;
      color: #D96B43;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    h4 {
      font-size: 9.5pt;
      color: #3B4151;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    /* Callout Card */
    .quack-callout {
      background: #FFFDF5;
      border-left: 4.5px solid #FFC800;
      border-right: 1px solid #FFE978;
      border-top: 1px solid #FFE978;
      border-bottom: 1px solid #FFE978;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .quack-callout p {
      margin: 4px 0;
    }

    .quack-callout strong {
      color: #D96B43;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8.5pt;
      background: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #E2E4E9;
    }

    th {
      background-color: #FFF7D1;
      color: #3B4151;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border-bottom: 2px solid #FFC800;
      font-family: 'Comfortaa', cursive, sans-serif;
      font-size: 8.5pt;
    }

    td {
      padding: 6px 9px;
      border-bottom: 1px solid #EAECEF;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #FAFAFA;
    }

    tr:hover td {
      background-color: #FFFDF0;
    }

    /* Lists */
    ul, ol {
      margin: 6px 0 10px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 3.5px;
    }

    /* Code & Math */
    code {
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 8.5pt;
      background: #F4F5F7;
      padding: 1px 4px;
      border-radius: 4px;
      color: #D96B43;
    }

    .math-display {
      margin: 10px 0;
      text-align: center;
      padding: 6px;
      background: #FFFDF5;
      border-radius: 6px;
      border: 1px solid #FFE978;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .mermaid-container {
      margin: 14px 0;
      text-align: center;
      background: #FFFDF8;
      border: 1px solid #FFE978;
      border-radius: 10px;
      padding: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .mermaid {
      display: flex;
      justify-content: center;
    }

    /* Divider */
    hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, #FFE978, #FFC800, #FFE978);
      margin: 22px 0;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      themeVariables: {
        primaryColor: '#FFE978',
        primaryTextColor: '#3B4151',
        primaryBorderColor: '#FFC800',
        lineColor: '#D96B43',
        secondaryColor: '#FFFDF5',
        tertiaryColor: '#FFFFFF'
      }
    });
  </script>
</head>
<body>

  <div class="header-banner">
    <div class="header-title-box">
      <h1>Universidad de los Andes | Ingeniería de Sistemas y Computación</h1>
      <h2>ISIS-2007: Diseño de Productos e Innovación en TI — Quack MVP</h2>
      <div class="header-badges">
        <span class="badge badge-primary">Documento Consolidado Ejercicios #1 al #5</span>
        <span class="badge badge-accent">Equipo: Grupo 4</span>
        <span class="badge">Octubre 2026</span>
        <span class="badge">«La primera IA a la que tú le enseñas» 🦆</span>
      </div>
    </div>
    ${logoDataUri ? `<img src="${logoDataUri}" alt="Logo Quack" class="header-logo" />` : ''}
  </div>

  <div class="content-body">
    ${bodyHtml}
  </div>

</body>
</html>`;

fs.writeFileSync(outHtmlPath, fullHtml, 'utf8');
console.log('HTML generated successfully at:', outHtmlPath);

// Generate PDF via Microsoft Edge Headless
console.log('Generating PDF with Microsoft Edge headless...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const command = `"${edgePath}" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 --print-to-pdf="${outPdfPath}" "${outHtmlPath}"`;

try {
  execSync(command, { stdio: 'inherit' });
  if (fs.existsSync(outPdfPath)) {
    const stats = fs.statSync(outPdfPath);
    console.log(`PDF created successfully at: ${outPdfPath} (${stats.size} bytes)`);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Error running Edge:', err);
}
