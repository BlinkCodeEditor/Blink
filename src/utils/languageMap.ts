export const languageMap: Record<string, string> = {
  js: 'javascript',
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
};

export function getLanguageByFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext && languageMap[ext] ? languageMap[ext] : 'plaintext';
}
