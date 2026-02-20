export const languageMap: Record<string, string> = {
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
