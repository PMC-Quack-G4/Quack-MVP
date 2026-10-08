const fs = require('fs');
const files = [
  'src/components/exam/AuditProgressAnimation.tsx',
  'src/components/exam/AuditSplitView.tsx',
  'src/components/exam/EvidenceDropzone.tsx',
  'src/components/exam/ExamFocusMode.tsx',
  'src/components/exam/ExamProblemSelector.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove shadows and blur
  content = content.replace(/\bshadow-(sm|md|lg|xl|2xl|2xs|inner|none)\b/g, '');
  content = content.replace(/\bshadow-quack-[a-z]+\/[0-9]+\b/g, '');
  content = content.replace(/\bshadow-[a-z]+-[0-9]+\/[0-9]+\b/g, '');
  content = content.replace(/\bshadow-[a-z]+-[0-9]+\b/g, ''); // shadow-amber-500 etc
  content = content.replace(/\bbackdrop-blur-(sm|md|lg|xl)\b/g, '');
  content = content.replace(/(?<=className=\"[^\"]*)\bshadow\b(?=[^\"]*\")/g, '');
  
  // Remove opacities from backgrounds
  content = content.replace(/bg-slate-50\/(50|80|90)/g, 'bg-slate-50');
  content = content.replace(/bg-slate-100\/(50|80|90)/g, 'bg-slate-100');
  content = content.replace(/bg-slate-900\/(50|60|80|90)/g, 'bg-quack-gunmetal'); // modal backgrounds
  content = content.replace(/bg-emerald-50\/(40|50|80)/g, 'bg-emerald-50');
  content = content.replace(/bg-amber-50\/(40|50|60|80)/g, 'bg-amber-50');
  content = content.replace(/bg-red-50\/(40|50|60|80)/g, 'bg-red-50');
  content = content.replace(/bg-quack-dandelion\/(15|20|50)/g, 'bg-quack-dandelion');
  content = content.replace(/bg-quack-amber\/(15|20|50)/g, 'bg-quack-amber');
  content = content.replace(/bg-white\/(50|80|90)/g, 'bg-white');
  content = content.replace(/bg-quack-gunmetal\/(80|85|90)/g, 'bg-quack-gunmetal');
  
  // Opacity borders
  content = content.replace(/border-amber-200\/(80|90)/g, 'border-amber-200');
  content = content.replace(/border-emerald-200\/(80|90)/g, 'border-emerald-200');
  content = content.replace(/border-red-200\/(80|90)/g, 'border-red-200');
  content = content.replace(/border-slate-200\/(80|90)/g, 'border-slate-200');
  content = content.replace(/border-white\/(20|50|80)/g, 'border-white');

  // Ring opacity
  content = content.replace(/ring-quack-amber\/[0-9]+/g, 'ring-quack-amber');
  content = content.replace(/ring-amber-400\/[0-9]+/g, 'ring-amber-400');
  content = content.replace(/ring-emerald-400\/[0-9]+/g, 'ring-emerald-400');
  content = content.replace(/ring-red-400\/[0-9]+/g, 'ring-red-400');
  
  // Replace gradients with solid colors
  content = content.replace(/bg-gradient-to-br from-quack-amber via-quack-sandy to-quack-caramel/g, 'bg-quack-amber');
  content = content.replace(/bg-gradient-to-b from-white to-slate-50\/50/g, 'bg-white');
  content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-[0-9]+ to-[a-z]+-[0-9]+/g, 'bg-white'); // generic fallback
  
  // Fix "anidacion de tarjetas" (Single-Layer Rule): Card with background white shouldn't have nested slate-50 blocks for header/footer
  content = content.replace(/bg-slate-50\s+border-b/g, 'border-b');
  content = content.replace(/border-b\s+bg-slate-50/g, 'border-b');
  content = content.replace(/border-t\s+bg-slate-50/g, 'border-t');
  content = content.replace(/bg-slate-50\s+border-t/g, 'border-t');

  // Any explicit text colors on headers/titles should use brand fonts
  content = content.replace(/text-slate-900/g, 'text-quack-gunmetal');

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Done");
