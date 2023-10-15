import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function useCapture<T extends HTMLElement>() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const compRef = useRef<T>(null);

  const captureImage = () => {
    if (!compRef.current) {
      return new Error("No Current Element Refs");
    }

    html2canvas(compRef.current).then((canvas) => {
      const data = canvas.toDataURL("image/png");
      const object = new Image();
      object.src = data;
      setImage(object);
    });
  };

  const savePDF = () => {
    if (!image) {
      return;
    }
    if (!image.src) {
      return;
    }

    const pdf = new jsPDF();
    const { width, height } = image;
    pdf.addImage(image.src, "PNG", 0, 0, width, height);
    pdf.save();
  };

  return { image, compRef, captureImage, savePDF };
}

export default useCapture;
