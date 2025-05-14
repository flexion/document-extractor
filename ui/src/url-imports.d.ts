// This gets the imports that have the `url` schema to work with the TypeScript compiler
// E.g. `import iconDotGov from 'url:../assets/icon-dot-gov.svg';`
declare module 'url:*' {
  const value: string;
  export default value;
}
