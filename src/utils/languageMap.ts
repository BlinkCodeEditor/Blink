export const languageMap: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  json: 'json',
  md: 'markdown',
  py: 'python',
  rust: 'rust',
  go: 'go',
  java: 'java',
  php: 'php',
  swift: 'swift',
  dart: 'dart',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  gitignore: 'plaintext',
  LICENSE: 'plaintext',
  sh: "shell",
  exe: "plaintext",
};

export const languageDisplayMap: Record<string, string> = {
  js: 'JavaScript',
  mjs: 'JavaScript',
  jsx: 'JavaScript (JSX)',
  ts: 'TypeScript',
  tsx: 'TypeScript (TSX)',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'SASS',
  json: 'JSON',
  md: 'Markdown',
  py: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  php: 'PHP',
  swift: 'Swift',
  dart: 'Dart',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  gitignore: 'Git Ignore',
  LICENSE: 'LICENSE',
  sh: "Shell",
  exe: "Executable",
};

export function getLanguageByFilename(filename: string): string {
  // Check exact filename first (e.g., "LICENSE", ".gitignore")
  if (languageMap[filename]) {
    return languageMap[filename];
  }
  
  // Otherwise check extension
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext && languageMap[ext] ? languageMap[ext] : 'plaintext';
}

export function getLanguageDisplayName(filename: string): string {
  // Check exact filename first
  if (languageDisplayMap[filename]) {
    return languageDisplayMap[filename];
  }
  
  // Otherwise check extension
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext && languageDisplayMap[ext] ? languageDisplayMap[ext] : 'Plaintext';
}
