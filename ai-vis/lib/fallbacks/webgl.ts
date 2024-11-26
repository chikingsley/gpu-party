export const initWebGL2Fallback = async (gl: WebGL2RenderingContext) => {
  // WebGL2 fallback implementation
};

export const initWebGL1Fallback = async (gl: WebGLRenderingContext) => {
  // WebGL1 fallback implementation
};

export const getDetailedErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return 'An unknown error occurred';
}; 