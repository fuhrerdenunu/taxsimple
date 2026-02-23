declare module 'tesseract.js' {
  const Tesseract: {
    recognize: (...args: any[]) => Promise<any>;
  };
  export default Tesseract;
}
