/**
 * CSS Module declarations for TypeScript
 */

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-phone-number-input/style.css" {
  const content: Record<string, string>;
  export default content;
}
