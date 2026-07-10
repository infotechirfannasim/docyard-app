// types/svg.d.ts  (or declarations.d.ts in root)
declare module "*.svg" {
  import React from "react";
    import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}